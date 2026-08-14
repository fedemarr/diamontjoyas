"use client";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { CategoryFormDialog } from "@/app/(admin)/admin/categorias/category-form-dialog";
import { SortableCategoryRow } from "@/app/(admin)/admin/categorias/sortable-category-row";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoriesApi } from "@/lib/admin-api";
import type { AdminCategory } from "@/types/admin";

export default function CategoriasPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  const categories = data?.categories ?? [];

  const reorderMutation = useMutation({
    mutationFn: categoriesApi.reorder,
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previous = queryClient.getQueryData<{ categories: AdminCategory[] }>(["categories"]);
      if (previous) {
        const byId = new Map(previous.categories.map((c) => [c.id, c]));
        queryClient.setQueryData(["categories"], {
          categories: ids.map((id) => byId.get(id)).filter((c): c is AdminCategory => !!c),
        });
      }
      return { previous };
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(["categories"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setPendingDelete(null);
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    reorderMutation.mutate(reordered.map((c) => c.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-bone">Categorías</h1>
          <p className="text-sm text-silver">
            Arrastrá de la manija para cambiar el orden en que aparecen en la tienda.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="bg-gradient-gold text-ink hover:opacity-90"
        >
          <Plus className="size-4" />
          Nueva categoría
        </Button>
      </div>

      <div className="rounded-lg border border-ink-border bg-ink-soft">
        {isLoading ? (
          <p className="p-6 text-sm text-silver">Cargando categorías...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-danger">No se pudieron cargar las categorías.</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-silver">Todavía no hay categorías.</p>
        ) : (
          // DndContext tiene que envolver la <Table> entera, no ir adentro:
          // inyecta un <div> de accesibilidad que sería hijo directo de
          // <table>, lo cual es HTML inválido (error de hidratación).
          // SortableContext no renderiza DOM propio, por eso sí puede ir
          // adentro, pegado al <TableBody>.
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {categories.map((category) => (
                    <SortableCategoryRow
                      key={category.id}
                      category={category}
                      onEdit={() => {
                        setEditing(category);
                        setDialogOpen(true);
                      }}
                      onDelete={() => setPendingDelete(category)}
                    />
                  ))}
                </TableBody>
              </SortableContext>
            </Table>
          </DndContext>
        )}
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        nextOrder={categories.length}
      />

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg border border-ink-border bg-ink-soft p-6">
            <h2 className="font-display text-lg font-semibold text-bone">
              ¿Eliminar &quot;{pendingDelete.name}&quot;?
            </h2>
            <p className="mt-2 text-sm text-silver">
              No se borra de verdad — queda desactivada y oculta de la tienda. Los productos que
              tenga siguen existiendo.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPendingDelete(null)}
                className="border-ink-border bg-transparent text-bone"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => deleteMutation.mutate(pendingDelete.id)}
                disabled={deleteMutation.isPending}
                className="bg-danger text-white hover:bg-danger/90"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
