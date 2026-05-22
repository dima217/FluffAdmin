"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListSearchInput } from "@/components/ListSearchInput";
import {
  useGetAdminUsersQuery,
  useDeleteUserMutation,
} from "@/lib/features/admin/adminApi";
import { Trash2, Edit } from "lucide-react";
import { useFilteredList } from "@/hooks/useFilteredList";
import { matchesSearch } from "@/lib/adminLabels";
import { formatDateRu } from "@/lib/formatDate";

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetAdminUsersQuery({ page, limit: 10 });
  const [deleteUser] = useDeleteUserMutation();

  const filterUser = useCallback(
    (user: {
      id: number;
      firstName?: string;
      lastName?: string;
      email?: string;
      isSuper?: boolean;
      isActive?: boolean;
      createdAt?: string;
    }, query: string) =>
      matchesSearch(
        query,
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        `${user.firstName ?? ""} ${user.lastName ?? ""}`
      ),
    []
  );

  const filteredUsers = useFilteredList(data?.data, search, filterUser);

  const handleDelete = async (id: number) => {
    if (confirm("Удалить этого пользователя?")) {
      try {
        await deleteUser(id).unwrap();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Пользователи</h1>
        <p className="text-muted-foreground">
          Управление пользователями системы
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Все пользователи</CardTitle>
          <ListSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Поиск по имени, email, ID..."
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Имя</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Статус</th>
                  <th className="text-left p-4">Супер-админ</th>
                  <th className="text-left p-4">Создан</th>
                  <th className="text-left p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {search.trim() ? "Ничего не найдено" : "Нет данных"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b hover:bg-gray-50 ${
                        user.isSuper ? "opacity-60" : ""
                      }`}
                    >
                      <td className="p-4">{user.id}</td>
                      <td className="p-4">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Активен" : "Неактивен"}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.isSuper ? (
                          <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                            Да
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                            Нет
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {user.createdAt ? formatDateRu(user.createdAt) : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            disabled={user.isSuper}
                            title={
                              user.isSuper
                                ? "Нельзя редактировать администратора"
                                : "Редактировать"
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(user.id)}
                            disabled={user.isSuper}
                            title={
                              user.isSuper
                                ? "Нельзя удалить администратора"
                                : "Удалить"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Показано {filteredUsers.length} из {data?.total || 0} пользователей
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
