"use client";

import { useParams, useRouter } from "next/navigation";
import { ListPageSuspense } from "@/components/ListPageSuspense";
import { useListReturnPath } from "@/hooks/useListReturnPath";
import { ArrowLeft, Calendar, Eye, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupportChat } from "@/components/support/SupportChat";
import { cn } from "@/lib/utils";
import { TICKET_STATUS_LABELS } from "@/lib/adminLabels";
import { formatDateTimeRu } from "@/lib/formatDate";

import {
  useGetSupportTicketByIdQuery,
  useChangeRequestStatusMutation,
  SupportTicketStatus,
} from "@/lib/features/admin/adminApi";

const STATUS_STYLES: Record<SupportTicketStatus, string> = {
  [SupportTicketStatus.OPEN]: "bg-blue-50 text-blue-700 border-blue-200",
  [SupportTicketStatus.IN_PROGRESS]:
    "bg-amber-50 text-amber-700 border-amber-200",
  [SupportTicketStatus.RESOLVED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [SupportTicketStatus.CLOSED]: "bg-gray-100 text-gray-600 border-gray-200",
};

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}

export default function SupportDetailPage() {
  return (
    <ListPageSuspense>
      <SupportDetailPageContent />
    </ListPageSuspense>
  );
}

function SupportDetailPageContent() {
  const router = useRouter();
  const listReturnPath = useListReturnPath("/admin/support");
  const params = useParams();
  const id = String(params.id);
  const ticketId = Number(id);

  const { data: ticket, isLoading } = useGetSupportTicketByIdQuery(
    { id },
    { skip: !id }
  );

  const [changeStatus, { isLoading: isUpdating }] =
    useChangeRequestStatusMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        Загрузка тикета...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        Тикет не найден
      </div>
    );
  }

  const isClosed =
    ticket.status === SupportTicketStatus.CLOSED ||
    ticket.status === SupportTicketStatus.RESOLVED;

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push(listReturnPath)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                Тикет #{ticket.id}
              </h1>
              <StatusBadge status={ticket.status as SupportTicketStatus} />
            </div>
            <p className="text-muted-foreground mt-1 max-w-xl">
              {ticket.subject}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <SupportChat
          ticketId={ticketId}
          disabled={isClosed}
          userId={ticket.userId}
          subject={ticket.subject}
        />

        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Детали</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Пользователь</p>
                  <p className="font-medium">#{ticket.userId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Создан</p>
                  <p className="font-medium">
                    {formatDateTimeRu(ticket.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                  <Eye className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Просмотрен админом</p>
                  <p className="font-medium">
                    {ticket.adminSeen ? (
                      <span className="text-emerald-600">Да</span>
                    ) : (
                      <span className="text-amber-600">Ещё нет</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Статус</CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-2">
              {Object.values(SupportTicketStatus).map((status) => (
                <Button
                  key={status}
                  variant={ticket.status === status ? "default" : "outline"}
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(status)}
                  className={cn(
                    "h-9 text-xs",
                    ticket.status === status &&
                      "bg-indigo-600 hover:bg-indigo-700"
                  )}
                  size="sm"
                >
                  {TICKET_STATUS_LABELS[status]}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
