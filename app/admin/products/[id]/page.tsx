'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { useGetAdminProductQuery, useUpdateAdminProductMutation } from '@/lib/features/admin/adminApi';

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: product, isLoading } = useGetAdminProductQuery(id, { skip: !id });
  const [updateProduct, { isLoading: isSaving }] = useUpdateAdminProductMutation();

  const [form, setForm] = useState({
    name: '',
    calories: '',
    massa: '',
    imageCover: '',
    imagePreview: '',
    fluffAt: '',
  });

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name ?? '',
      calories: product.calories !== undefined && product.calories !== null ? String(product.calories) : '',
      massa: product.massa !== undefined && product.massa !== null ? String(product.massa) : '',
      imageCover: product.image?.cover ?? '',
      imagePreview: product.image?.preview ?? '',
      fluffAt: product.fluffAt ? String(product.fluffAt) : '',
    });
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body: any = {
      name: form.name,
      calories: form.calories ? Number(form.calories) : undefined,
      massa: form.massa ? Number(form.massa) : undefined,
      fluffAt: form.fluffAt || undefined,
      image:
        form.imageCover || form.imagePreview
          ? {
              cover: form.imageCover,
              preview: form.imagePreview,
            }
          : undefined,
    };

    Object.keys(body).forEach((k) => (body[k] === undefined ? delete body[k] : undefined));

    try {
      await updateProduct({ id, body }).unwrap();
      alert('Product updated successfully');
      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="calories" className="text-sm font-medium">
                  Calories
                </label>
                <Input
                  id="calories"
                  type="number"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="massa" className="text-sm font-medium">
                  Mass (g)
                </label>
                <Input
                  id="massa"
                  type="number"
                  value={form.massa}
                  onChange={(e) => setForm({ ...form, massa: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="fluffAt" className="text-sm font-medium">
                  Fluff At (ISO string)
                </label>
                <Input id="fluffAt" value={form.fluffAt} onChange={(e) => setForm({ ...form, fluffAt: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="imageCover" className="text-sm font-medium">
                  Image Cover URL
                </label>
                <Input
                  id="imageCover"
                  value={form.imageCover}
                  onChange={(e) => setForm({ ...form, imageCover: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="imagePreview" className="text-sm font-medium">
                  Image Preview URL
                </label>
                <Input
                  id="imagePreview"
                  value={form.imagePreview}
                  onChange={(e) => setForm({ ...form, imagePreview: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
