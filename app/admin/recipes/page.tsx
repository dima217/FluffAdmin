/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListSearchInput } from "@/components/ListSearchInput";
import { ListPageSuspense } from "@/components/ListPageSuspense";
import { Trash2, Edit, Plus, Check, X } from "lucide-react";
import {
  useGetAdminRecipesQuery,
  useDeleteRecipeMutation,
  useGetAdminRecipesRequestsQuery,
  useUpdateAdminRecipeMutation,
} from "@/lib/features/admin/adminApi";
import { RadioRecipe } from "@/components/radio-recipes";
import { useFilteredList } from "@/hooks/useFilteredList";
import { useListQueryParams } from "@/hooks/useListQueryParams";
import { matchesSearch } from "@/lib/adminLabels";
import { formatDateRu } from "@/lib/formatDate";

function RecipesPageContent() {
  const router = useRouter();
  const { page, search, tab, setPage, setSearch, setTab, hrefWithQuery } =
    useListQueryParams({ tabKey: "tab", tabDefault: "option1" });

  const selectedValue = tab === "option2" ? "option2" : "option1";

  const recipes = useGetAdminRecipesQuery(
    { page, limit: 10 },
    { skip: selectedValue !== "option1" }
  );

  const requests = useGetAdminRecipesRequestsQuery(
    { page, limit: 10 },
    { skip: selectedValue === "option1" }
  );

  const [updateRecipe] = useUpdateAdminRecipeMutation();
  const [deleteRecipe] = useDeleteRecipeMutation();

  const data = selectedValue === "option1" ? recipes.data : requests.data;
  const isLoading =
    selectedValue === "option1" ? recipes.isLoading : requests.isLoading;

  const filterRecipe = useCallback(
    (recipe: any, query: string) =>
      matchesSearch(query, recipe.id, recipe.name, recipe.type?.name),
    []
  );

  const filteredItems = useFilteredList(data?.data, search, filterRecipe);

  const handleDelete = async (id: number) => {
    if (confirm("Удалить этот рецепт?")) {
      try {
        await deleteRecipe(id).unwrap();
      } catch (error) {
        console.error("Failed to delete recipe:", error);
      }
    }
  };

  if (isLoading && !data) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Рецепты</h1>
          <p className="text-muted-foreground">Управление рецептами в системе</p>
        </div>
        <Button onClick={() => router.push("/admin/recipes/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Создать рецепт
        </Button>
      </div>

      <RadioRecipe value={selectedValue} onChange={setTab} />

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>
            {selectedValue === "option1" ? "Все рецепты" : "Запросы на добавление"}
          </CardTitle>
          <ListSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Поиск по названию, типу, ID..."
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Название</th>
                  <th className="text-left p-4">Тип</th>
                  <th className="text-left p-4">Рейтинг</th>
                  <th className="text-left p-4">Калории</th>
                  <th className="text-left p-4">Создан</th>
                  <th className="text-left p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {search.trim() ? "Ничего не найдено" : "Нет данных"}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((recipe: any) => (
                    <tr key={recipe.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{recipe.id}</td>
                      <td className="p-4">{recipe.name}</td>
                      <td className="p-4">{recipe.type?.name || "—"}</td>
                      <td className="p-4">
                        {Number(recipe.average || 0).toFixed(2)}
                      </td>
                      <td className="p-4">{recipe.calories}</td>
                      <td className="p-4">{formatDateRu(recipe.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {selectedValue !== "option1" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="accept"
                                onClick={() =>
                                  updateRecipe({
                                    id: recipe.id,
                                    body: { isFluff: true },
                                  })
                                }
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  updateRecipe({
                                    id: recipe.id,
                                    body: { isFluff: null },
                                  })
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                hrefWithQuery(`/admin/recipes/${recipe.id}`)
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {selectedValue === "option1" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(recipe.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
              Показано {filteredItems.length} из {data?.total || 0} рецептов
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

export default function RecipesPage() {
  return (
    <ListPageSuspense>
      <RecipesPageContent />
    </ListPageSuspense>
  );
}
