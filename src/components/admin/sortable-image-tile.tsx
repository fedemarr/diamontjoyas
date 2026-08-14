"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, Trash2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AdminProductImage } from "@/types/admin";

export function SortableImageTile({
  image,
  id,
  onAltChange,
  onMakePrimary,
  onRemove,
}: {
  image: AdminProductImage;
  id: string;
  onAltChange: (alt: string) => void;
  onMakePrimary: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex gap-3 rounded-lg border border-ink-border bg-ink p-2",
        isDragging && "relative z-10 opacity-80"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center px-1 text-silver hover:text-gold active:cursor-grabbing"
        aria-label="Reordenar imagen"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-ink-soft">
        <Image src={image.url} alt={image.alt || ""} fill sizes="80px" className="object-cover" />
        {image.isPrimary && (
          <span className="absolute top-1 left-1 rounded-full bg-gold p-0.5">
            <Star className="size-3 fill-ink text-ink" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <Input
          value={image.alt}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="Texto alternativo (obligatorio)"
          className="h-8 border-ink-border bg-ink-soft text-xs text-bone placeholder:text-silver/60"
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={image.isPrimary ? "secondary" : "outline"}
            onClick={onMakePrimary}
            disabled={image.isPrimary}
            className="h-7 border-ink-border bg-transparent px-2 text-xs text-bone"
          >
            <Star className="size-3" />
            {image.isPrimary ? "Principal" : "Marcar principal"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onRemove}
            className="h-7 px-2 text-xs text-silver hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-3" />
            Quitar
          </Button>
        </div>
      </div>
    </div>
  );
}
