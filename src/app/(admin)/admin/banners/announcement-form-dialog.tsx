"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

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
import { announcementsApi } from "@/lib/admin-api";
import { announcementSchema, type AnnouncementInput } from "@/lib/validations/banner";
import type { AdminAnnouncement } from "@/types/admin";

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
  nextOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: AdminAnnouncement | null;
  nextOrder: number;
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { text: "", linkUrl: "", order: nextOrder, isActive: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      announcement
        ? {
            text: announcement.text,
            linkUrl: announcement.linkUrl ?? "",
            order: announcement.order,
            isActive: announcement.isActive,
          }
        : { text: "", linkUrl: "", order: nextOrder, isActive: true }
    );
  }, [open, announcement, nextOrder, reset]);

  const mutation = useMutation({
    mutationFn: (data: AnnouncementInput) =>
      announcement
        ? announcementsApi.update(announcement.id, data)
        : announcementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {announcement ? "Editar anuncio" : "Nuevo anuncio"}
          </DialogTitle>
          <DialogDescription>
            Aparece rotando en la barra superior del sitio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="text">Texto</Label>
            <Input
              id="text"
              placeholder="Envíos gratis desde $80.000"
              {...register("text")}
              className="border-ink-border bg-ink text-bone"
            />
            {errors.text && <p className="text-xs text-danger">{errors.text.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="linkUrl">Link (opcional)</Label>
            <Input
              id="linkUrl"
              placeholder="/tienda"
              {...register("linkUrl")}
              className="border-ink-border bg-ink text-bone"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={watch("isActive")}
              onCheckedChange={(v) => setValue("isActive", v)}
              id="announcement-active"
            />
            <Label htmlFor="announcement-active" className="cursor-pointer">Anuncio activo</Label>
          </div>

          {mutation.isError && (
            <p className="text-sm text-danger">No se pudo guardar el anuncio.</p>
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
              {announcement ? "Guardar cambios" : "Crear anuncio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
