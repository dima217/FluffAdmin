"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListPageSuspense } from "@/components/ListPageSuspense";
import { Trash2, Plus } from "lucide-react";
import { useGetAdminReviewsQuery } from "@/lib/features/admin/adminApi";
import { useListQueryParams } from "@/hooks/useListQueryParams";
import { formatDateRu } from "@/lib/formatDate";

function ReviewsPageContent() {
  const router = useRouter();
  const { page, setPage } = useListQueryParams();
  const { data, isLoading } = useGetAdminReviewsQuery({ page, limit: 10 });

  const handleDelete = async (id: number) => {
    if (confirm("Удалить этот отзыв?")) {
      try {
        console.log("Delete review:", id);
      } catch (error) {
        console.error("Failed to delete review:", error);
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
          <h1 className="text-3xl font-bold">Управление отзывами</h1>
          <p className="text-muted-foreground">Управление всеми отзывами в системе</p>
        </div>
        <Button onClick={() => router.push("/admin/reviews/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Создать отзыв
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все отзывы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Пользователь</th>
                  <th className="text-left p-4">Тип сущности</th>
                  <th className="text-left p-4">Оценка</th>
                  <th className="text-left p-4">Сообщение</th>
                  <th className="text-left p-4">Создан</th>
                  <th className="text-left p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((review: any) => (
                  <tr key={review.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{review.id}</td>
                    <td className="p-4">
                      {review.user
                        ? `${review.user.firstName ?? ""} ${review.user.lastName ?? ""}`.trim() ||
                          review.user.username ||
                          review.user.email ||
                          `#${review.user.id}`
                        : "—"}
                    </td>
                    <td className="p-4">{review.relatedEntityType}</td>
                    <td className="p-4">{review.score}</td>
                    <td className="p-4 max-w-xs truncate">{review.message || "—"}</td>
                    <td className="p-4">{formatDateRu(review.created)}</td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(review.id)}
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
              Показано {data?.data.length || 0} из {data?.total || 0} отзывов
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

export default function ReviewsPage() {
  return (
    <ListPageSuspense>
      <ReviewsPageContent />
    </ListPageSuspense>
  );
}
