'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Trash2, Edit, Plus, Accessibility, Check, X } from 'lucide-react';
import { useGetAdminRecipesQuery, useDeleteRecipeMutation, useGetAdminRecipesRequestsQuery, useUpdateAdminRecipeMutation } from '@/lib/features/admin/adminApi';
import { RadioRecipe } from '@/components/radio-recipes';
import React from 'react';

export default function RecipesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageRequest, setPageRequest] = useState(1);

  const [selectedValue, setSelectedValue] = React.useState("option1")

  const recipes = useGetAdminRecipesQuery({ page, limit: 10 }, {
    skip: selectedValue !== "option1"
  })
  
  const requests = useGetAdminRecipesRequestsQuery({ page: pageRequest, limit: 10 }, {
    skip: selectedValue === "option1"
  })

  const [updateRecipe, { isLoading: isSaving }] = useUpdateAdminRecipeMutation();
  
  const data = selectedValue === "option1" 
    ? recipes.data 
    : requests.data

  const isLoading = selectedValue === "option1"
    ? recipes.isLoading
    : requests.isLoading;

  const [deleteRecipe] = useDeleteRecipeMutation();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id).unwrap();
      } catch (error) {
        console.error('Failed to delete recipe:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recipes Management</h1>
          <p className="text-muted-foreground">Manage all recipes in the system</p>
        </div>
        <Button onClick={() => router.push('/admin/recipes/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Recipe
        </Button>
      </div>
      <RadioRecipe value={selectedValue} onChange={setSelectedValue}/>
      <Card>
        <CardHeader>
          <CardTitle>All Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Rating</th>
                  <th className="text-left p-4">Calories</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((recipe: any) => (
                  <tr key={recipe.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{recipe.id}</td>
                    <td className="p-4">{recipe.name}</td>
                    <td className="p-4">{recipe.type?.name || 'N/A'}</td>
                    <td className="p-4">{Number(recipe.average || 0).toFixed(2)}</td>
                    <td className="p-4">{recipe.calories}</td>
                    <td className="p-4">{format(new Date(recipe.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        { selectedValue !== "option1" &&
                          <div className="flex gap-2">
                            <Button size="sm" variant="accept" onClick={() => updateRecipe({id: recipe.id, body: { isFluff: true } })}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateRecipe({id: recipe.id, body: { isFluff: null } })}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        }
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/admin/recipes/${recipe.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        { selectedValue === "option1" &&
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(recipe.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {data?.data.length || 0} of {data?.total || 0} recipes
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedValue === "option1" ? setPage(page - 1) : setPageRequest(pageRequest - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedValue === "option1" ? setPage(page + 1) : setPageRequest(pageRequest + 1)}
                disabled={!data || data.data.length < 10}
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
