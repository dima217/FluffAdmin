import { useCallback, useEffect, useRef, useState } from "react";
import { useLazyGetTicketMessagesQuery } from "@/lib/features/admin/adminApi";
import { useAppSelector } from "@/lib/hooks";
import { uploadSupportAttachments } from "@/lib/support/supportAttachments";
import {
  mergeSupportMessages,
  normalizeSupportMessage,
  parseMessagesResponse,
} from "@/lib/support/supportMessages";
import { supportWs } from "@/lib/support/supportSocket";
import type {
  SupportMessageAttachment,
  SupportMessageDto,
} from "@/types/support";

export function useSupportChat(ticketId: number) {
  const [messages, setMessages] = useState<SupportMessageDto[]>([]);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const accessToken = useAppSelector((s : any) => s.auth?.accessToken);
  const adminUserId = useAppSelector((s : any) => s.auth?.userId) ?? 0;

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRequestsRef = useRef<Map<string, number>>(new Map());
  const [fetchMessages] = useLazyGetTicketMessagesQuery();
  const fetchMessagesRef = useRef(fetchMessages);
  fetchMessagesRef.current = fetchMessages;

  const postMessage = useCallback(
    (
      content: string,
      attachments?: SupportMessageAttachment[]
    ) => {
      const trimmed = content.trim();
      const hasAttachments = Boolean(attachments?.length);
      if ((!trimmed && !hasAttachments) || !ticketId || Number.isNaN(ticketId)) {
        return;
      }

      const clientRequestId = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const tempId = -Date.now();

      pendingRequestsRef.current.set(clientRequestId, tempId);

      const optimistic: SupportMessageDto = {
        id: tempId,
        ticketId,
        senderId: adminUserId,
        senderType: "admin",
        content: trimmed || "",
        createdAt: new Date().toISOString(),
        editedAt: null,
        attachments,
      };

      setMessages((prev) => [...prev, optimistic]);

      supportWs.send("support.send", {
        ticket_id: ticketId,
        content: trimmed || "",
        client_request_id: clientRequestId,
        ...(attachments?.length ? { attachments } : {}),
      });
    },
    [adminUserId, ticketId]
  );

  useEffect(() => {
    if (!ticketId || Number.isNaN(ticketId)) return;

    let cancelled = false;
    setMessages([]);
    setIsLoadingMessages(true);

    fetchMessagesRef.current({ id: String(ticketId) })
      .unwrap()
      .then((res) => {
        if (cancelled) return;
        setMessages(parseMessagesResponse(res));
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMessages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId || Number.isNaN(ticketId)) return;

    supportWs.joinTicket(ticketId);
    supportWs.send("support.read", { ticket_id: ticketId });

    const offMessage = supportWs.on("support.message", (data) => {
      const msg = normalizeSupportMessage(data);
      if (!msg || (msg.ticketId && msg.ticketId !== ticketId)) return;

      setMessages((prev) => mergeSupportMessages(prev, msg));

      if (msg.senderType === "user") {
        supportWs.send("support.read", { ticket_id: ticketId });
      }
    });

    const offEdit = supportWs.on("support.edit", (data) => {
      const messageId = Number(data.message_id ?? data.messageId);
      const content = data.content;
      const editedAt = data.edited_at ?? data.editedAt;

      if (!messageId || content == null) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: String(content),
                editedAt: editedAt ? String(editedAt) : m.editedAt,
              }
            : m
        )
      );
    });

    const offTyping = supportWs.on("support.typing", (data) => {
      const ticket_id = Number(data.ticket_id ?? data.ticketId);
      if (ticket_id && ticket_id !== ticketId) return;

      const isAdmin = Boolean(data.is_admin ?? data.isAdmin);
      const isTyping = Boolean(data.is_typing ?? data.isTyping);
      if (isAdmin) return;

      setIsUserTyping(isTyping);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

      if (isTyping) {
        typingTimerRef.current = setTimeout(() => setIsUserTyping(false), 3000);
      }
    });

    const offAck = supportWs.on("support.send.ack", (data) => {
      const clientRequestId = String(
        data.client_request_id ?? data.clientRequestId ?? ""
      );
      const messageId = Number(data.message_id ?? data.messageId);
      const createdAt = String(data.created_at ?? data.createdAt ?? "");

      if (!clientRequestId || !messageId) return;

      const tempId = pendingRequestsRef.current.get(clientRequestId);
      if (tempId === undefined) return;

      pendingRequestsRef.current.delete(clientRequestId);
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        const existing = withoutTemp.find((m) => m.id === messageId);
        if (existing) return withoutTemp;

        const optimistic = prev.find((m) => m.id === tempId);
        if (!optimistic) return withoutTemp;

        return mergeSupportMessages(withoutTemp, {
          ...optimistic,
          id: messageId,
          createdAt: createdAt || optimistic.createdAt,
        });
      });
    });

    return () => {
      supportWs.leaveTicket(ticketId);
      offMessage();
      offEdit();
      offTyping();
      offAck();
      pendingRequestsRef.current.clear();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [ticketId]);

  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      let attachments: SupportMessageAttachment[] | undefined;

      if (files?.length) {
        if (!accessToken) return false;
        setIsUploading(true);
        try {
          attachments = await uploadSupportAttachments(files, accessToken);
        } catch {
          return false;
        } finally {
          setIsUploading(false);
        }
      }

      postMessage(content, attachments);
      return true;
    },
    [accessToken, postMessage]
  );

  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      if (!ticketId || Number.isNaN(ticketId)) return;
      supportWs.send("support.typing", {
        ticket_id: ticketId,
        is_typing: isTyping,
      });
    },
    [ticketId]
  );

  return {
    messages,
    isUserTyping,
    isLoadingMessages,
    isUploading,
    sendMessage,
    notifyTyping,
  };
}
