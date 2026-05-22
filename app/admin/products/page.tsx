/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListSearchInput } from "@/components/ListSearchInput";
import { Trash2, Edit, Plus } from "lucide-react";
import {
  useGetAdminProductsQuery,
  useDeleteProductMutation,
} from "@/lib/features/admin/adminApi";
import { useFilteredList } from "@/hooks/useFilteredList";
import { matchesSearch } from "@/lib/adminLabels";
import { formatDateRu } from "@/lib/formatDate";

export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetAdminProductsQuery({ page, limit: 10 });
  const [deleteProduct] = useDeleteProductMutation();

  const filterProduct = useCallback(
    (product: any, query: string) =>
      matchesSearch(query, product.id, product.name),
    []
  );

  const filteredProducts = useFilteredList(data?.data, search, filterProduct);

  const handleDelete = async (id: number) => {
    if (confirm("Удалить этот продукт?")) {
      try {
        await deleteProduct(id).unwrap();
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Продукты</h1>
          <p className="text-muted-foreground">Управление продуктами в системе</p>
        </div>
        <Button onClick={() => router.push("/admin/products/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Создать продукт
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Все продукты</CardTitle>
          <ListSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Поиск по названию, ID..."
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Название</th>
                  <th className="text-left p-4">Калории</th>
                  <th className="text-left p-4">Масса (г)</th>
                  <th className="text-left p-4">В избранном</th>
                  <th className="text-left p-4">Создан</th>
                  <th className="text-left p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {search.trim() ? "Ничего не найдено" : "Нет данных"}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product: any) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{product.id}</td>
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">{product.calories}</td>
                      <td className="p-4">{product.massa}</td>
                      <td className="p-4">{product.countFavorites || 0}</td>
                      <td className="p-4">{formatDateRu(product.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/admin/products/${product.id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
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
              Показано {filteredProducts.length} из {data?.total || 0} продуктов
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
