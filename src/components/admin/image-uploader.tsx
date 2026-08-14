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
import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { SortableImageTile } from "@/components/admin/sortable-image-tile";
import { uploadImageToCloudinary } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import type { AdminProductImage } from "@/types/admin";

/**
 * Uploader drag & drop multi-imagen (sección 5 del prompt maestro):
 * reordenables (dnd-kit), marcar principal, alt obligatorio.
 * El upload en sí va firmado desde el server (lib/cloudinary.ts) — acá
 * solo se sube el archivo directo a Cloudinary con esa firma.
 */
export function ImageUploader({
  images,
  onChange,
}: {
  images: AdminProductImage[];
  onChange: (images: AdminProductImage[]) => void;
}) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Las imágenes no tienen `id` estable hasta que se guardan (las nuevas
  // vienen sin id) — dnd-kit necesita una key estable igual, se arma acá.
  const withKeys = images.map((img, i) => ({ ...img, _key: img.id ?? `new-${i}-${img.url}` }));

  async function handleFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    setUploading(true);
    try {
      const uploaded: AdminProductImage[] = [];
      for (const file of list) {
        const { url } = await uploadImageToCloudinary(file);
        uploaded.push({
          id: "",
          url,
          alt: "",
          order: 0,
          isPrimary: false,
        });
      }

      const merged = [...images, ...uploaded].map((img, i) => ({
        ...img,
        order: i,
        isPrimary: i === 0 ? true : img.isPrimary,
      }));
      onChange(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo la imagen");
    } finally {
      setUploading(false);
    }
  }

  function updateAt(key: string, patch: Partial<AdminProductImage>) {
    onChange(
      withKeys.map(({ _key, ...img }) => (_key === key ? { ...img, ...patch } : img))
    );
  }

  function makePrimary(key: string) {
    onChange(
      withKeys.map(({ _key, ...img }) => ({ ...img, isPrimary: _key === key }))
    );
  }

  function remove(key: string) {
    const filtered = withKeys.filter((img) => img._key !== key);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- se descarta _key a propósito
    const reindexed = filtered.map(({ _key, ...img }, i) => ({ ...img, order: i }));
    // Si se borró la principal, la nueva primera pasa a ser principal.
    if (reindexed.length > 0 && !reindexed.some((img) => img.isPrimary)) {
      reindexed[0].isPrimary = true;
    }
    onChange(reindexed);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = withKeys.findIndex((img) => img._key === active.id);
    const newIndex = withKeys.findIndex((img) => img._key === over.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- se descarta _key a propósito
    const reordered = arrayMove(withKeys, oldIndex, newIndex).map(({ _key, ...img }, i) => ({
      ...img,
      order: i,
    }));
    onChange(reordered);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-border bg-ink px-4 py-8 text-center transition-colors hover:border-gold/50",
          isDraggingOver && "border-gold bg-ink-soft"
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-gold" />
        ) : (
          <ImagePlus className="size-6 text-silver" />
        )}
        <p className="text-sm text-silver">
          {uploading ? "Subiendo..." : "Arrastrá imágenes acá o hacé clic para elegir"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {withKeys.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={withKeys.map((img) => img._key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {withKeys.map((img) => (
                <SortableImageTile
                  key={img._key}
                  id={img._key}
                  image={img}
                  onAltChange={(alt) => updateAt(img._key, { alt })}
                  onMakePrimary={() => makePrimary(img._key)}
                  onRemove={() => remove(img._key)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
