"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { AdminCategory } from "@/types/admin";

export function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: AdminCategory;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 bg-ink-soft opacity-80" : undefined}
    >
      <TableCell className="w-8">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-silver hover:text-gold active:cursor-grabbing"
          aria-label="Reordenar"
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-silver">{category.slug}</TableCell>
      <TableCell className="text-silver">{category._count?.products ?? 0}</TableCell>
      <TableCell>
        {category.isActive ? (
          <Badge className="border-success/40 bg-success/10 text-success" variant="outline">
            Activa
          </Badge>
        ) : (
          <Badge variant="outline" className="border-ink-border text-silver">
            Inactiva
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label={`Editar ${category.name}`}
            className="text-silver hover:bg-ink-border hover:text-gold"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Eliminar ${category.name}`}
            className="text-silver hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
