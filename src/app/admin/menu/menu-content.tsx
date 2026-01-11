'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, FolderOpen, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types/database';

interface MenuContentProps {
  restaurantId: string;
  categories: Category[];
  products: Product[];
}

export function MenuContent({ restaurantId, categories, products }: MenuContentProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    categories[0]?.id || null
  );
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [isAddingProduct, setIsAddingProduct] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newProduct, setNewProduct] = React.useState({ name: '', price: '' });
  const [isLoading, setIsLoading] = React.useState(false);

  const categoryProducts = products.filter((p) => p.category_id === selectedCategory);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsLoading(true);
    const supabase = getClient();

    const { error } = await supabase.from('categories').insert({
      restaurant_id: restaurantId,
      name: newCategoryName.trim(),
      sort_order: categories.length,
      is_active: true,
    });

    if (!error) {
      setNewCategoryName('');
      setIsAddingCategory(false);
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price || !selectedCategory) return;

    setIsLoading(true);
    const supabase = getClient();

    const priceCents = Math.round(parseFloat(newProduct.price) * 100);

    const { error } = await supabase.from('products').insert({
      restaurant_id: restaurantId,
      category_id: selectedCategory,
      name: newProduct.name.trim(),
      price_cents: priceCents,
      sort_order: categoryProducts.length,
      is_available: true,
    });

    if (!error) {
      setNewProduct({ name: '', price: '' });
      setIsAddingProduct(false);
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Eliminar esta categoría y todos sus productos?')) return;

    const supabase = getClient();
    await supabase.from('categories').delete().eq('id', categoryId);
    router.refresh();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Eliminar este producto?')) return;

    const supabase = getClient();
    await supabase.from('products').delete().eq('id', productId);
    router.refresh();
  };

  const handleToggleAvailability = async (product: Product) => {
    const supabase = getClient();
    await supabase
      .from('products')
      .update({ is_available: !product.is_available })
      .eq('id', product.id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Gestión del Menú</h1>
          <p className="text-muted-foreground mt-1">
            {categories.length} categorías · {products.length} productos
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Categories Panel */}
        <motion.div
          className="bg-card rounded-2xl border p-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Categorías</h2>
            <Button size="sm" variant="outline" onClick={() => setIsAddingCategory(true)}>
              <Plus className="size-4" />
            </Button>
          </div>

          {/* Add category form */}
          {isAddingCategory && (
            <form onSubmit={handleAddCategory} className="mb-4 space-y-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nombre categoría"
                autoFocus
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Añadir'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingCategory(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {/* Category list */}
          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className={cn(
                  'group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors',
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                )}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="size-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-60">
                    {products.filter((p) => p.category_id === category.id).length}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                  <ChevronRight className="size-4 opacity-40" />
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-sm">No hay categorías</p>
            )}
          </div>
        </motion.div>

        {/* Products Panel */}
        <motion.div
          className="bg-card rounded-2xl border p-4 lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">
              Productos
              {selectedCategory && (
                <span className="text-muted-foreground ml-2 font-normal">
                  ({categories.find((c) => c.id === selectedCategory)?.name})
                </span>
              )}
            </h2>
            <Button size="sm" onClick={() => setIsAddingProduct(true)} disabled={!selectedCategory}>
              <Plus className="mr-1 size-4" />
              Producto
            </Button>
          </div>

          {/* Add product form */}
          {isAddingProduct && (
            <form
              onSubmit={handleAddProduct}
              className="bg-secondary mb-4 space-y-3 rounded-xl p-4"
            >
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Nombre producto"
                autoFocus
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="Precio (€)"
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Añadir producto'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingProduct(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {/* Product list */}
          {selectedCategory ? (
            <div className="space-y-2">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-secondary flex items-center justify-between rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p
                        className={cn(
                          'font-medium',
                          !product.is_available && 'line-through opacity-50'
                        )}
                      >
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-muted-foreground text-sm">{product.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">€{(product.price_cents / 100).toFixed(2)}</span>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => handleToggleAvailability(product)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive size-8"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {categoryProducts.length === 0 && (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No hay productos en esta categoría
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Selecciona una categoría para ver sus productos
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
