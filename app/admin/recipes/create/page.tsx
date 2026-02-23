"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import {
  useCreateAdminRecipeMutation,
  useGetAdminProductsQuery,
} from "@/lib/features/admin/adminApi";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export default function AdminRecipeCreatePage() {
  const router = useRouter();
  const [createRecipe, { isLoading: isSaving }] =
    useCreateAdminRecipeMutation();
  const { data: productsData } = useGetAdminProductsQuery({
    page: 1,
    limit: 500,
  });
  const products = productsData?.data ?? [];

  const [form, setForm] = useState({
    name: "",
    recipeTypeId: "",
    calories: "",
    cookAt: "",
    description: "",
    imageCover: "",
    imagePreview: "",
    promotionalVideo: "",
    fluffAt: "",
    stepsConfigJson: '{\n  "steps": []\n}',
    productIds: [] as number[],
    customProductsJson: "[]",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let stepsConfig: any;
    try {
      stepsConfig = form.stepsConfigJson.trim()
        ? JSON.parse(form.stepsConfigJson)
        : { steps: [] };
    } catch {
      alert("stepsConfig JSON is invalid");
      return;
    }

    let customProducts: any[] = [];
    try {
      customProducts = form.customProductsJson.trim()
        ? JSON.parse(form.customProductsJson)
        : [];
      if (!Array.isArray(customProducts)) customProducts = [];
    } catch {
      alert("Custom products JSON is invalid");
      return;
    }

    const body: any = {
      name: form.name,
      recipeTypeId: Number(form.recipeTypeId),
      calories: Number(form.calories),
      cookAt: Number(form.cookAt),
      description: form.description || undefined,
      promotionalVideo: form.promotionalVideo || undefined,
      fluffAt: form.fluffAt || undefined,
      image: {
        cover: form.imageCover,
        preview: form.imagePreview,
      },
      stepsConfig,
      productIds: form.productIds,
      customProducts,
    };

    try {
      const created = await createRecipe(body).unwrap();
      alert("Recipe created successfully");
      if (created?.id) {
        router.push(`/admin/recipes/${created.id}`);
      } else {
        router.push("/admin/recipes");
      }
    } catch (err) {
      console.error("Failed to create recipe:", err);

      let errorMessage = "Something went wrong";

      const error = err as FetchBaseQueryError | SerializedError;

      if ("status" in error) {
        // Ошибка от сервера (FetchBaseQueryError)
        const data = error.data as any;

        if (typeof data === "string") {
          errorMessage = data;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.error) {
          errorMessage = data.error;
        } else {
          errorMessage = `Error ${error.status}`;
        }
      } else if (error.message) {
        // SerializedError
        errorMessage = error.message;
      }

      alert(errorMessage);
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
          <h1 className="text-3xl font-bold">Create Recipe</h1>
          <p className="text-muted-foreground">Add a new recipe</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipe Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="recipeTypeId" className="text-sm font-medium">
                  Recipe Type ID
                </label>
                <Input
                  id="recipeTypeId"
                  value={form.recipeTypeId}
                  onChange={(e) =>
                    setForm({ ...form, recipeTypeId: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="calories" className="text-sm font-medium">
                  Calories
                </label>
                <Input
                  id="calories"
                  type="number"
                  value={form.calories}
                  onChange={(e) =>
                    setForm({ ...form, calories: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cookAt" className="text-sm font-medium">
                  Cook Time (seconds)
                </label>
                <Input
                  id="cookAt"
                  type="number"
                  value={form.cookAt}
                  onChange={(e) => setForm({ ...form, cookAt: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="fluffAt" className="text-sm font-medium">
                  Fluff At (ISO string)
                </label>
                <Input
                  id="fluffAt"
                  value={form.fluffAt}
                  onChange={(e) =>
                    setForm({ ...form, fluffAt: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                className="w-full min-h-24 border rounded-md px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="imageCover" className="text-sm font-medium">
                  Image Cover URL
                </label>
                <Input
                  id="imageCover"
                  value={form.imageCover}
                  onChange={(e) =>
                    setForm({ ...form, imageCover: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="imagePreview" className="text-sm font-medium">
                  Image Preview URL
                </label>
                <Input
                  id="imagePreview"
                  value={form.imagePreview}
                  onChange={(e) =>
                    setForm({ ...form, imagePreview: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="promotionalVideo" className="text-sm font-medium">
                Promotional Video URL
              </label>
              <Input
                id="promotionalVideo"
                value={form.promotionalVideo}
                onChange={(e) =>
                  setForm({ ...form, promotionalVideo: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Продукты из базы
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Выберите продукты из списка (будут отправлены как productIds)
              </p>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Нет продуктов в базе или загрузка...
                  </p>
                ) : (
                  products.map((p: { id: number; name: string }) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(p.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((prev) => ({
                            ...prev,
                            productIds: checked
                              ? [...prev.productIds, p.id]
                              : prev.productIds.filter((id) => id !== p.id),
                          }));
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">
                        {p.name} <span className="text-muted-foreground">(ID: {p.id})</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="customProductsJson" className="text-sm font-medium">
                Кастомные продукты
              </label>
              <p className="text-xs text-muted-foreground mb-1">
                JSON-массив объектов, например: [{`{"name": "Соль", "amount": "по вкусу"}`}]
              </p>
              <textarea
                id="customProductsJson"
                className="w-full min-h-24 border rounded-md px-3 py-2 font-mono text-xs"
                value={form.customProductsJson}
                onChange={(e) =>
                  setForm({ ...form, customProductsJson: e.target.value })
                }
                placeholder={'[{"name": "Соль", "amount": "по вкусу"}]'}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="stepsConfigJson" className="text-sm font-medium">
                Steps Config (JSON)
              </label>
              <textarea
                id="stepsConfigJson"
                className="w-full min-h-56 border rounded-md px-3 py-2 font-mono text-xs"
                value={form.stepsConfigJson}
                onChange={(e) =>
                  setForm({ ...form, stepsConfigJson: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Creating..." : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
