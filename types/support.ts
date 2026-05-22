export type MessageSenderType = "user" | "admin";

export type SupportMessageAttachmentType = "image" | "file";

export interface SupportMessageAttachment {
  url: string;
  type?: SupportMessageAttachmentType;
  name?: string;
}

export interface SupportMessageDto {
  id: number;
  ticketId: number;
  senderId: number;
  senderType: MessageSenderType;
  content: string;
  attachments?: SupportMessageAttachment[];
  createdAt: string;
  editedAt: string | null;
}

export interface SupportTicketDto {
  id: number;
  userId: number;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  adminResponse: string | null;
  adminSeen: boolean;
  hasUnreadAdminMessage: boolean;
  createdAt: string;
  updatedAt: string;
}
