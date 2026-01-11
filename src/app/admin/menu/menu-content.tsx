'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types/database';

interface MenuContentProps {
  restaurantId: string;
  restaurantSlug: string;
  categories: Category[];
  products: Product[];
}

// ============= SORTABLE CATEGORY ITEM =============
interface SortableCategoryProps {
  category: Category;
  isSelected: boolean;
  productCount: number;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableCategory({
  category,
  isSelected,
  productCount,
  onSelect,
  onEdit,
  onDelete,
}: SortableCategoryProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-xl border p-3 transition-colors',
        isSelected
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card hover:bg-accent',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1 opacity-50 hover:opacity-100"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Name - clickable to select */}
      <button className="flex-1 text-left text-sm font-medium" onClick={onSelect}>
        {category.name}
      </button>

      {/* Product count and actions - grouped together */}
      <div className="flex items-center gap-1">
        <span className="pr-2 text-xs opacity-60">{productCount}</span>
        <Button size="icon" variant="ghost" className="size-8" onClick={onEdit}>
          <Pencil className="size-3" />
        </Button>
        <Button size="icon" variant="ghost" className="size-8" onClick={onDelete}>
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

// ============= SORTABLE PRODUCT ITEM =============
interface SortableProductProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}

function SortableProduct({
  product,
  onEdit,
  onDelete,
  onToggleAvailability,
}: SortableProductProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-card flex items-center gap-3 rounded-xl border p-3',
        isDragging && 'opacity-50 shadow-lg',
        !product.is_available && 'opacity-50'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1 opacity-50 hover:opacity-100"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Product info */}
      <div className="min-w-0 flex-1">
        <p className={cn('truncate font-medium', !product.is_available && 'line-through')}>
          {product.name}
        </p>
        {product.description && (
          <p className="text-muted-foreground truncate text-sm">{product.description}</p>
        )}
      </div>

      {/* Price */}
      <span className="font-semibold whitespace-nowrap">
        €{(product.price_cents / 100).toFixed(2)}
      </span>

      {/* Availability toggle */}
      <Switch checked={product.is_available} onCheckedChange={onToggleAvailability} />

      {/* Edit button */}
      <Button size="icon" variant="ghost" className="size-8" onClick={onEdit}>
        <Pencil className="size-4" />
      </Button>

      {/* Delete button */}
      <Button size="icon" variant="ghost" className="text-destructive size-8" onClick={onDelete}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

// ============= MAIN COMPONENT =============
export function MenuContent({
  restaurantSlug,
  categories: initialCategories,
  products: initialProducts,
}: MenuContentProps) {
  const router = useRouter();

  // Local state for optimistic updates
  const [categories, setCategories] = React.useState(initialCategories);
  const [products, setProducts] = React.useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    initialCategories[0]?.id || null
  );

  // Loading states
  const [isLoading, setIsLoading] = React.useState(false);

  // Modal states
  const [categoryModal, setCategoryModal] = React.useState<{ open: boolean; category?: Category }>({
    open: false,
  });
  const [productModal, setProductModal] = React.useState<{ open: boolean; product?: Product }>({
    open: false,
  });

  // Form states
  const [categoryName, setCategoryName] = React.useState('');
  const [productForm, setProductForm] = React.useState({
    name: '',
    description: '',
    price: '',
  });

  const categoryProducts = products
    .filter((p) => p.category_id === selectedCategory)
    .sort((a, b) => a.sort_order - b.sort_order);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ============= CATEGORY HANDLERS =============
  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const newOrder = arrayMove(categories, oldIndex, newIndex);

    // Optimistic update
    setCategories(newOrder);

    // Persist to server
    await fetch(`/api/restaurants/${restaurantSlug}/categories/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: newOrder.map((c, i) => ({ id: c.id, sortOrder: i })),
      }),
    });
    router.refresh();
  };

  const openCategoryModal = (category?: Category) => {
    setCategoryName(category?.name || '');
    setCategoryModal({ open: true, category });
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;
    setIsLoading(true);

    if (categoryModal.category) {
      // Edit
      await fetch(`/api/restaurants/${restaurantSlug}/categories`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: categoryModal.category.id,
          name: categoryName.trim(),
        }),
      });
    } else {
      // Create
      await fetch(`/api/restaurants/${restaurantSlug}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryName.trim(),
          sortOrder: categories.length,
        }),
      });
    }

    setCategoryModal({ open: false });
    setIsLoading(false);
    router.refresh();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Eliminar esta categoría y todos sus productos?')) return;
    await fetch(`/api/restaurants/${restaurantSlug}/categories?id=${categoryId}`, {
      method: 'DELETE',
    });
    router.refresh();
  };

  // ============= PRODUCT HANDLERS =============
  const handleProductDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoryProducts.findIndex((p) => p.id === active.id);
    const newIndex = categoryProducts.findIndex((p) => p.id === over.id);
    const newOrder = arrayMove(categoryProducts, oldIndex, newIndex);

    // Optimistic update
    const updatedProducts = products.map((p) => {
      const idx = newOrder.findIndex((np) => np.id === p.id);
      if (idx !== -1) return { ...p, sort_order: idx };
      return p;
    });
    setProducts(updatedProducts);

    // Persist
    await fetch(`/api/restaurants/${restaurantSlug}/products/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: newOrder.map((p, i) => ({ id: p.id, sortOrder: i })),
      }),
    });
    router.refresh();
  };

  const openProductModal = (product?: Product) => {
    setProductForm({
      name: product?.name || '',
      description: product?.description || '',
      price: product ? (product.price_cents / 100).toFixed(2) : '',
    });
    setProductModal({ open: true, product });
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.price) return;
    setIsLoading(true);
    const priceCents = Math.round(parseFloat(productForm.price) * 100);

    if (productModal.product) {
      // Edit
      await fetch(`/api/restaurants/${restaurantSlug}/products`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productModal.product.id,
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          priceCents,
        }),
      });
    } else {
      // Create
      await fetch(`/api/restaurants/${restaurantSlug}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory,
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          priceCents,
          sortOrder: categoryProducts.length,
        }),
      });
    }

    setProductModal({ open: false });
    setIsLoading(false);
    router.refresh();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await fetch(`/api/restaurants/${restaurantSlug}/products?id=${productId}`, {
      method: 'DELETE',
    });
    router.refresh();
  };

  const handleToggleAvailability = async (product: Product) => {
    // Optimistic update
    setProducts(
      products.map((p) => (p.id === product.id ? { ...p, is_available: !p.is_available } : p))
    );

    await fetch(`/api/restaurants/${restaurantSlug}/products`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        isAvailable: !product.is_available,
      }),
    });
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
            <Button size="sm" onClick={() => openCategoryModal()}>
              <Plus className="mr-1 size-4" />
              Añadir
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {categories.map((category) => (
                  <SortableCategory
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.id}
                    productCount={products.filter((p) => p.category_id === category.id).length}
                    onSelect={() => setSelectedCategory(category.id)}
                    onEdit={() => openCategoryModal(category)}
                    onDelete={() => handleDeleteCategory(category.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {categories.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">No hay categorías</p>
          )}
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
            <Button size="sm" onClick={() => openProductModal()} disabled={!selectedCategory}>
              <Plus className="mr-1 size-4" />
              Añadir
            </Button>
          </div>

          {selectedCategory ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleProductDragEnd}
            >
              <SortableContext
                items={categoryProducts.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {categoryProducts.map((product) => (
                    <SortableProduct
                      key={product.id}
                      product={product}
                      onEdit={() => openProductModal(product)}
                      onDelete={() => handleDeleteProduct(product.id)}
                      onToggleAvailability={() => handleToggleAvailability(product)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : null}

          {selectedCategory && categoryProducts.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No hay productos en esta categoría
            </p>
          )}

          {!selectedCategory && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Selecciona una categoría
            </p>
          )}
        </motion.div>
      </div>

      {/* Category Modal */}
      <Modal
        open={categoryModal.open}
        onClose={() => setCategoryModal({ open: false })}
        title={categoryModal.category ? 'Editar categoría' : 'Nueva categoría'}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Nombre de la categoría"
              autoFocus
              className="border-input bg-background w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCategoryModal({ open: false })}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Product Modal */}
      <Modal
        open={productModal.open}
        onClose={() => setProductModal({ open: false })}
        title={productModal.product ? 'Editar producto' : 'Nuevo producto'}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="Nombre del producto"
              autoFocus
              className="border-input bg-background w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción (opcional)</label>
            <input
              type="text"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Descripción breve"
              className="border-input bg-background w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Precio (€)</label>
            <input
              type="number"
              step="0.01"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              placeholder="0.00"
              className="border-input bg-background w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setProductModal({ open: false })}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
