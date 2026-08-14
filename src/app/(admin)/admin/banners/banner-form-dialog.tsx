"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { bannersApi, uploadImageToCloudinary } from "@/lib/admin-api";
import { bannerSchema, type BannerInput } from "@/lib/validations/banner";
import type { AdminBanner } from "@/types/admin";

export function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  nextOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: AdminBanner | null;
  nextOrder: number;
}) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof bannerSchema>, unknown, z.output<typeof bannerSchema>>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      mobileImageUrl: null,
      linkUrl: "",
      order: nextOrder,
      isActive: true,
      startsAt: null,
      endsAt: null,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      banner
        ? {
            title: banner.title,
            subtitle: banner.subtitle ?? "",
            imageUrl: banner.imageUrl,
            mobileImageUrl: banner.mobileImageUrl ?? "",
            linkUrl: banner.linkUrl ?? "",
            order: banner.order,
            isActive: banner.isActive,
            startsAt: banner.startsAt,
            endsAt: banner.endsAt,
          }
        : {
            title: "",
            subtitle: "",
            imageUrl: "",
            mobileImageUrl: null,
            linkUrl: "",
            order: nextOrder,
            isActive: true,
            startsAt: null,
            endsAt: null,
          }
    );
  }, [open, banner, nextOrder, reset]);

  const mutation = useMutation({
    mutationFn: (data: BannerInput) => (banner ? bannersApi.update(banner.id, data) : bannersApi.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      onOpenChange(false);
    },
  });

  const imageUrl = watch("imageUrl");

  async function handleUpload(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const { url } = await uploadImageToCloudinary(file);
      setValue("imageUrl", url, { shouldValidate: true });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error subiendo la imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{banner ? "Editar banner" : "Nuevo banner"}</DialogTitle>
          <DialogDescription>
            Se muestra en el hero del home. Imagen recomendada ~1600×600px.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-border bg-ink px-4 py-6 text-center transition-colors hover:border-gold/50"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- imagen de banner, no requiere next/image
              <img
                src={imageUrl}
                alt="Vista previa del banner"
                className="max-h-32 w-full rounded-md object-cover"
              />
            ) : uploading ? (
              <Loader2 className="size-6 animate-spin text-gold" />
            ) : (
              <ImagePlus className="size-6 text-silver" />
            )}
            <p className="text-sm text-silver">
              {uploading ? "Subiendo..." : "Subí la imagen del banner"}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </div>
          {uploadError && <p className="text-sm text-danger">{uploadError}</p>}
          {errors.imageUrl && <p className="text-xs text-danger">Subí una imagen o cargá una URL válida.</p>}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Colección Oro 18k"
              {...register("title")}
              className="border-ink-border bg-ink text-bone"
            />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
            <Input
              id="subtitle"
              placeholder="El brillo que perdura"
              {...register("subtitle")}
              className="border-ink-border bg-ink text-bone"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="linkUrl">Link (opcional)</Label>
              <Input
                id="linkUrl"
                placeholder="/tienda?material=ORO_18K"
                {...register("linkUrl")}
                className="border-ink-border bg-ink text-bone"
              />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(v) => setValue("isActive", v)}
                id="banner-active"
              />
              <Label htmlFor="banner-active" className="cursor-pointer">Banner activo</Label>
            </div>
          </div>

          {mutation.isError && (
            <p className="text-sm text-danger">No se pudo guardar el banner. Revisá los datos.</p>
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
              disabled={mutation.isPending}
              className="bg-gradient-gold text-ink hover:opacity-90"
            >
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {banner ? "Guardar cambios" : "Crear banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
