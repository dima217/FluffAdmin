"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ArrowLeft } from "lucide-react";

import {
  useGetSupportTicketByIdQuery,
  useReplyOnRequestMutation,
  useChangeRequestStatusMutation,
  SupportTicketStatus,
} from "@/lib/features/admin/adminApi";

export default function SupportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const { data: ticket, isLoading } = useGetSupportTicketByIdQuery(
    { id },
    { skip: !id }
  );

  const [reply, setReply] = useState("");

  const [replyOnRequest, { isLoading: isReplying }] =
    useReplyOnRequestMutation();

  const [changeStatus, { isLoading: isUpdating }] =
    useChangeRequestStatusMutation();

  if (isLoading) return <div>Loading...</div>;
  if (!ticket) return <div>Ticket not found</div>;

  const handleReply = async () => {
    if (!reply.trim()) return;

    try {
      await replyOnRequest({
        id,
        response: reply,
      }).unwrap();

      alert("Reply sent");
      setReply("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (status: SupportTicketStatus) => {
    try {
      await changeStatus({
        id,
        body: { status },
      }).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Ticket #{ticket.id}</h1>
          <p className="text-muted-foreground">Support request details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <strong>User ID:</strong> {ticket.userId}
          </div>

          <div>
            <strong>Subject:</strong> {ticket.subject}
          </div>

          <div>
            <strong>Message:</strong>
            <p className="mt-1 whitespace-pre-line">{ticket.message}</p>
          </div>

          <div>
            <strong>Status:</strong> {ticket.status}
          </div>

          <div>
            <strong>Admin Response:</strong>
            <p className="mt-1 whitespace-pre-line">
              {ticket.adminResponse || "No response yet"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Status</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-2 flex-wrap">
          {Object.values(SupportTicketStatus).map((status) => (
            <Button
              key={status}
              variant="outline"
              disabled={isUpdating}
              onClick={() => handleStatusChange(status)}
            >
              {status}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reply to Ticket</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <textarea
            className="w-full min-h-32 border rounded-md px-3 py-2"
            placeholder="Write admin response..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />

          <Button onClick={handleReply} disabled={isReplying}>
            {isReplying ? "Sending..." : "Send Reply"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
