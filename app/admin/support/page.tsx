/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListSearchInput } from "@/components/ListSearchInput";
import { MessageSquare } from "lucide-react";
import { useGetAllSupportTicketsQuery } from "@/lib/features/admin/adminApi";
import { useSupportTicketEvents } from "@/hooks/useSupportTicketEvents";
import { useFilteredList } from "@/hooks/useFilteredList";
import {
  matchesSearch,
  TICKET_STATUS_LABELS,
} from "@/lib/adminLabels";
import { SupportTicketStatus } from "@/lib/features/admin/adminApi";
import { formatDateRu } from "@/lib/formatDate";

export default function SupportPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useGetAllSupportTicketsQuery({
    page,
    limit: 10,
  });

  const handleTicketEvent = useCallback(() => {
    void refetch();
  }, [refetch]);

  useSupportTicketEvents(handleTicketEvent);

  const filterTicket = useCallback(
    (ticket: any, query: string) =>
      matchesSearch(
        query,
        ticket.id,
        ticket.userId,
        ticket.subject,
        TICKET_STATUS_LABELS[ticket.status as SupportTicketStatus]
      ),
    []
  );

  const filteredTickets = useFilteredList(data?.tickets, search, filterTicket);

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Поддержка</h1>
        <p className="text-muted-foreground">Управление обращениями пользователей</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Все тикеты</CardTitle>
          <ListSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Поиск по теме, ID, пользователю..."
          />
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Пользователь</th>
                  <th className="text-left p-4">Тема</th>
                  <th className="text-left p-4">Статус</th>
                  <th className="text-left p-4">Просмотр</th>
                  <th className="text-left p-4">Создан</th>
                  <th className="text-left p-4">Действия</th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {search.trim() ? "Ничего не найдено" : "Нет данных"}
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket: any) => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{ticket.id}</td>
                      <td className="p-4">{ticket.userId}</td>
                      <td className="p-4 max-w-xs truncate">{ticket.subject}</td>
                      <td className="p-4">
                        {TICKET_STATUS_LABELS[ticket.status as SupportTicketStatus] ??
                          ticket.status}
                      </td>
                      <td className="p-4">
                        {ticket.adminSeen ? (
                          <span className="text-muted-foreground">Просмотрен</span>
                        ) : (
                          <span className="text-orange-600 font-medium">Новый</span>
                        )}
                      </td>
                      <td className="p-4">{formatDateRu(ticket.createdAt)}</td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/admin/support/${ticket.id}`)
                          }
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Показано {filteredTickets.length} из {data?.total || 0} тикетов
              {search.trim() ? " (фильтр на текущей странице)" : ""}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Назад
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!data || data.tickets.length < 10}
              >
                Далее
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
