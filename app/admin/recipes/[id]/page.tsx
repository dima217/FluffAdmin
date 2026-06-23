/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import {
  useGetAdminRecipeQuery,
  useUpdateAdminRecipeMutation,
  useGetAdminProductsQuery,
} from "@/lib/features/admin/adminApi";
import { useMediaUrl } from "@/hooks/useMediaUrl";
import { useAuthenticatedMediaSrc } from "@/hooks/useAuthenticatedMediaSrc";

export default function AdminRecipeEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: recipe, isLoading } = useGetAdminRecipeQuery(id, { skip: !id });
  const [updateRecipe, { isLoading: isSaving }] =
    useUpdateAdminRecipeMutation();
  const { data: productsData } = useGetAdminProductsQuery({
    page: 1,
    limit: 500,
  });
  const products = productsData?.data ?? [];

  const coverMedia = useMediaUrl(recipe?.image?.cover, {
    skip: !recipe?.image?.cover,
  });

  const previewMedia = useMediaUrl(recipe?.image?.preview, {
    skip: !recipe?.image?.preview,
  });

  function StepImage({ url }: { url?: string }) {
    const media = useMediaUrl(url, { skip: !url });

    if (!media.url) return null;

    return (
      <img
        src={media.url}
        alt="step"
        className="w-full h-70 object-cover rounded-md mt-2"
        {...(media.headers ? { headers: media.headers } : {})}
      />
    );
  }

  function PromoVideoPreview({ url }: { url?: string }) {
    const { src, isLoading } = useAuthenticatedMediaSrc(url, { skip: !url });

    if (!url) return null;
    if (isLoading) {
      return (
        <p className="text-sm text-muted-foreground mt-2">Загрузка видео...</p>
      );
    }
    if (!src) return null;

    return (
      <video
        src={src}
        controls
        className="w-full max-h-96 rounded-md mt-2 bg-black"
      />
    );
  }

  const initialStepsJson = useMemo(() => {
    if (!recipe?.stepsConfig) return '{\n  "steps": []\n}';
    return JSON.stringify(recipe.stepsConfig, null, 2);
  }, [recipe?.stepsConfig]);

  const initialProductIds = useMemo(() => {
    if (!recipe) return [];
    if (Array.isArray(recipe.productIds)) return recipe.productIds;
    if (Array.isArray(recipe.products))
      return recipe.products.map((p: { id: number }) => p.id);
    return [];
  }, [recipe]);

  const initialCustomProductsJson = useMemo(() => {
    if (!recipe?.customProducts || !Array.isArray(recipe.customProducts))
      return "[]";
    return JSON.stringify(recipe.customProducts, null, 2);
  }, [recipe?.customProducts]);

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
    makePublic: true,
    submitToSystem: false,
  });

  useEffect(() => {
    if (!recipe) return;

    setForm({
      name: recipe.name ?? "",
      recipeTypeId: recipe.type?.id ? String(recipe.type.id) : "",
      calories:
        recipe.calories !== undefined && recipe.calories !== null
          ? String(recipe.calories)
          : "",
      cookAt:
        recipe.cookAt !== undefined && recipe.cookAt !== null
          ? String(recipe.cookAt)
          : "",
      description: recipe.description ?? "",
      imageCover: recipe.image?.cover ?? "",
      imagePreview: recipe.image?.preview ?? "",
      promotionalVideo: recipe.promotionalVideo ?? "",
      fluffAt: recipe.fluffAt ? String(recipe.fluffAt) : "",
      stepsConfigJson: initialStepsJson,
      productIds: initialProductIds,
      customProductsJson: initialCustomProductsJson,
      makePublic: recipe.makePublic ?? true,
      submitToSystem: recipe.submitToSystem ?? false,
    });
  }, [recipe, initialStepsJson, initialProductIds, initialCustomProductsJson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let stepsConfig: any | undefined;
    try {
      stepsConfig = form.stepsConfigJson.trim()
        ? JSON.parse(form.stepsConfigJson)
        : undefined;
    } catch {
      alert("JSON stepsConfig некорректен");
      return;
    }

    let customProducts: any[] = [];
    try {
      customProducts = form.customProductsJson.trim()
        ? JSON.parse(form.customProductsJson)
        : [];
      if (!Array.isArray(customProducts)) customProducts = [];
    } catch {
      alert("JSON кастомных продуктов некорректен");
      return;
    }

    const body: any = {
      name: form.name,
      recipeTypeId: form.recipeTypeId ? Number(form.recipeTypeId) : undefined,
      calories: form.calories ? Number(form.calories) : undefined,
      cookAt: form.cookAt ? Number(form.cookAt) : undefined,
      description: form.description || undefined,
      promotionalVideo: form.promotionalVideo || undefined,
      fluffAt: form.fluffAt || undefined,
      image:
        form.imageCover || form.imagePreview
          ? {
              cover: form.imageCover,
              preview: form.imagePreview,
            }
          : undefined,
      stepsConfig,
      products: form.productIds.map((id) => ({ id })),
      customProducts,
      makePublic: form.makePublic,
      submitToSystem: form.submitToSystem,
    };

    Object.keys(body).forEach((k) =>
      body[k] === undefined ? delete body[k] : undefined
    );

    try {
      await updateRecipe({ id, body }).unwrap();
      alert("Рецепт успешно обновлён");
      router.push("/admin/recipes");
    } catch (error) {
      console.error("Failed to update recipe:", error);
      alert("Не удалось обновить рецепт");
    }
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (!recipe) return <div>Рецепт не найден</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Редактирование рецепта</h1>
          <p className="text-muted-foreground">Изменение данных рецепта</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Данные рецепта</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Название
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
                  ID типа рецепта
                </label>
                <Input
                  id="recipeTypeId"
                  value={form.recipeTypeId}
                  onChange={(e) =>
                    setForm({ ...form, recipeTypeId: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="calories" className="text-sm font-medium">
                  Калории
                </label>
                <Input
                  id="calories"
                  type="number"
                  value={form.calories}
                  onChange={(e) =>
                    setForm({ ...form, calories: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cookAt" className="text-sm font-medium">
                  Время приготовления (сек)
                </label>
                <Input
                  id="cookAt"
                  type="number"
                  value={form.cookAt}
                  onChange={(e) => setForm({ ...form, cookAt: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="fluffAt" className="text-sm font-medium">
                  Fluff At (ISO строка)
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
                Описание
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
                  URL обложки
                </label>
                <Input
                  id="imageCover"
                  value={form.imageCover}
                  onChange={(e) =>
                    setForm({ ...form, imageCover: e.target.value })
                  }
                />

                {coverMedia.url && (
                  <img
                    src={coverMedia.url}
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="imagePreview" className="text-sm font-medium">
                  URL превью
                </label>
                <Input
                  id="imagePreview"
                  value={form.imagePreview}
                  onChange={(e) =>
                    setForm({ ...form, imagePreview: e.target.value })
                  }
                />

                {previewMedia.url && (
                  <img
                    src={previewMedia.url}
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="promotionalVideo" className="text-sm font-medium">
                URL промо-видео
              </label>
              <Input
                id="promotionalVideo"
                value={form.promotionalVideo}
                onChange={(e) =>
                  setForm({ ...form, promotionalVideo: e.target.value })
                }
              />

              <PromoVideoPreview url={form.promotionalVideo} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Продукты из базы</label>
              <p className="text-xs text-muted-foreground mb-2">
                Выберите продукты из списка
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
                        {p.name}{" "}
                        <span className="text-muted-foreground">
                          (ID: {p.id})
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="customProductsJson"
                className="text-sm font-medium"
              >
                Кастомные продукты
              </label>
              <p className="text-xs text-muted-foreground mb-1">
                JSON-массив объектов, например: [{`{"name": "Соль", "grams": 5, "unit": "г"}`}]
              </p>
              <textarea
                id="customProductsJson"
                className="w-full min-h-24 border rounded-md px-3 py-2 font-mono text-xs"
                value={form.customProductsJson}
                onChange={(e) =>
                  setForm({ ...form, customProductsJson: e.target.value })
                }
                placeholder={'[{"name": "Соль", "grams": 5, "unit": "г"}]'}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="stepsConfigJson" className="text-sm font-medium">
                Конфигурация шагов (JSON)
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

            {recipe?.stepsConfig?.steps?.length > 0 && (
              <div className="space-y-3 mt-3">
                {recipe.stepsConfig.steps.map((step: any, index: number) => (
                  <div key={index} className="border p-3 rounded-md">
                    <div className="text-sm font-medium">
                      Шаг {index + 1}: {step.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                    <StepImage url={step?.resources?.[0]?.source} />{" "}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.makePublic}
                  onChange={(e) => setForm({ ...form, makePublic: e.target.checked })}
                  className="rounded border-gray-300 w-4 h-4"
                />
                <span className="text-sm font-medium">Опубликовать (makePublic)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.submitToSystem}
                  onChange={(e) => setForm({ ...form, submitToSystem: e.target.checked })}
                  className="rounded border-gray-300 w-4 h-4"
                />
                <span className="text-sm font-medium">Отправить в систему (submitToSystem)</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Сохранение..." : "Сохранить изменения"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
