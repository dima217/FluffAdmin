/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListPageSuspense } from "@/components/ListPageSuspense";
import { Trash2, Plus } from "lucide-react";
import { useGetAdminTrackingQuery } from "@/lib/features/admin/adminApi";
import { useListQueryParams } from "@/hooks/useListQueryParams";
import { formatDateRu } from "@/lib/formatDate";

function TrackingPageContent() {
  const router = useRouter();
  const { page, setPage } = useListQueryParams();
  const { data, isLoading } = useGetAdminTrackingQuery({ page, limit: 10 });

  const handleDelete = async (id: number) => {
    if (confirm("Удалить эту запись трекинга?")) {
      try {
        console.log("Delete tracking:", id);
      } catch (error) {
        console.error("Failed to delete tracking:", error);
      }
    }
  };

  if (isLoading && !data) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управление трекингом</h1>
          <p className="text-muted-foreground">
            Управление всеми записями трекинга в системе
          </p>
        </div>
        <Button onClick={() => router.push("/admin/tracking/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Создать запись
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все записи трекинга</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Пользователь</th>
                  <th className="text-left p-4">Название</th>
                  <th className="text-left p-4">Калории</th>
                  <th className="text-left p-4">Рецепт</th>
                  <th className="text-left p-4">Создан</th>
                  <th className="text-left p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((tracking: any) => (
                  <tr key={tracking.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{tracking.id}</td>
                    <td className="p-4">
                      {tracking.user?.firstName} {tracking.user?.lastName}
                    </td>
                    <td className="p-4">{tracking.name}</td>
                    <td className="p-4">{tracking.calories}</td>
                    <td className="p-4">{tracking.recipe?.name || "—"}</td>
                    <td className="p-4">
                      {formatDateRu(tracking.created)}
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(tracking.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Показано {data?.data.length || 0} из {data?.total || 0} записей
              трекинга
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
                disabled={!data || data.data.length < 10}
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

export default function TrackingPage() {
  return (
    <ListPageSuspense>
      <TrackingPageContent />
    </ListPageSuspense>
  );
}
