"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { categoriesApi } from "@/lib/admin-api";
import { slugify } from "@/lib/utils";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import type { AdminCategory } from "@/types/admin";

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  nextOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: AdminCategory | null;
  nextOrder: number;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      icon: "",
      order: nextOrder,
      isActive: true,
      parentId: null,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        category
          ? {
              name: category.name,
              slug: category.slug,
              description: category.description ?? "",
              imageUrl: category.imageUrl ?? "",
              icon: category.icon ?? "",
              order: category.order,
              isActive: category.isActive,
              parentId: category.parentId,
            }
          : {
              name: "",
              slug: "",
              description: "",
              imageUrl: "",
              icon: "",
              order: nextOrder,
              isActive: true,
              parentId: null,
            }
      );
    }
  }, [open, category, nextOrder, reset]);

  const name = watch("name");
  const isActive = watch("isActive");

  const mutation = useMutation({
    mutationFn: (data: CategoryInput) =>
      isEditing ? categoriesApi.update(category.id, data) : categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onOpenChange(false);
    },
  });

  function onNameChange(value: string) {
    setValue("name", value);
    if (!isEditing) {
      setValue("slug", slugify(value));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name">Nombre</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="border-ink-border bg-ink text-bone"
            />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-slug">
              Slug{" "}
              <span className="font-normal text-silver">— así aparece en la URL de la tienda</span>
            </Label>
            <Input
              id="cat-slug"
              {...register("slug")}
              className="border-ink-border bg-ink text-bone"
            />
            {errors.slug && <p className="text-xs text-danger">{errors.slug.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-description">Descripción</Label>
            <Textarea id="cat-description" {...register("description")} rows={3} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-image">
              URL de imagen{" "}
              <span className="font-normal text-silver">— se sube desde el uploader más adelante</span>
            </Label>
            <Input
              id="cat-image"
              {...register("imageUrl")}
              placeholder="https://..."
              className="border-ink-border bg-ink text-bone"
            />
            {errors.imageUrl && <p className="text-xs text-danger">{errors.imageUrl.message}</p>}
          </div>

          <div className="flex items-center justify-between rounded-md border border-ink-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-bone">Activa</p>
              <p className="text-xs text-silver">Se muestra en la tienda si está activa</p>
            </div>
            <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
          </div>

          {mutation.isError && (
            <p role="alert" className="text-sm text-danger">
              {(mutation.error as Error).message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-ink-border bg-transparent text-bone"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="bg-gradient-gold text-ink hover:opacity-90"
            >
              {isEditing ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
