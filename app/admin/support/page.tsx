/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

import { useGetAllSupportTicketsQuery } from "@/lib/features/admin/adminApi";
import { useSupportTicketEvents } from "@/hooks/useSupportTicketEvents";

export default function SupportPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetAllSupportTicketsQuery({
    page,
    limit: 10,
  });

  const handleTicketEvent = useCallback(() => {
    void refetch();
  }, [refetch]);

  useSupportTicketEvents(handleTicketEvent);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <p className="text-muted-foreground">Manage all support requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">User ID</th>
                  <th className="text-left p-4">Subject</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Seen</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {data?.tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{ticket.id}</td>
                    <td className="p-4">{ticket.userId}</td>
                    <td className="p-4 max-w-xs truncate">{ticket.subject}</td>
                    <td className="p-4 capitalize">
                      {String(ticket.status).replace("_", " ")}
                    </td>
                    <td className="p-4">
                      {ticket.adminSeen ? (
                        <span className="text-muted-foreground">Seen</span>
                      ) : (
                        <span className="text-orange-600 font-medium">New</span>
                      )}
                    </td>
                    <td className="p-4">
                      {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                    </td>
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {data?.tickets.length || 0} of {data?.total || 0} tickets
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!data || data.tickets.length < 10}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
