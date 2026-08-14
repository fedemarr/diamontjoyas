"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AnnouncementFormDialog } from "@/app/(admin)/admin/banners/announcement-form-dialog";
import { BannerFormDialog } from "@/app/(admin)/admin/banners/banner-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { announcementsApi, bannersApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import type { AdminAnnouncement, AdminBanner } from "@/types/admin";

type Tab = "banners" | "anuncios";

export default function BannersPage() {
  const [tab, setTab] = useState<Tab>("banners");
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AdminAnnouncement | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ kind: "banner" | "announcement"; id: string } | null>(null);

  const queryClient = useQueryClient();

  const bannersQuery = useQuery({ queryKey: ["banners"], queryFn: bannersApi.list });
  const announcementsQuery = useQuery({ queryKey: ["announcements"], queryFn: announcementsApi.list });

  const deleteMutation = useMutation({
    mutationFn: (target: { kind: "banner" | "announcement"; id: string }) =>
      target.kind === "banner" ? bannersApi.remove(target.id) : announcementsApi.remove(target.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setPendingDelete(null);
    },
  });

  const banners = bannersQuery.data?.banners ?? [];
  const announcements = announcementsQuery.data?.announcements ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-bone">Banners y anuncios</h1>
          <p className="text-sm text-silver">
            Contenido visual del home y la barra superior.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-lg border border-ink-border bg-ink-soft p-1">
        <TabButton active={tab === "banners"} onClick={() => setTab("banners")}>
          <ImageIcon className="size-4" />
          Banners del home
        </TabButton>
        <TabButton active={tab === "anuncios"} onClick={() => setTab("anuncios")}>
          <Megaphone className="size-4" />
          Barra de anuncios
        </TabButton>
      </div>

      {tab === "banners" ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-silver">{banners.length} banners</p>
            <Button
              onClick={() => {
                setEditingBanner(null);
                setBannerDialogOpen(true);
              }}
              className="bg-gradient-gold text-ink hover:opacity-90"
            >
              <Plus className="size-4" />
              Nuevo banner
            </Button>
          </div>
          <div className="rounded-lg border border-ink-border bg-ink-soft">
            {bannersQuery.isLoading ? (
              <p className="p-6 text-sm text-silver">Cargando banners...</p>
            ) : banners.length === 0 ? (
              <p className="p-6 text-sm text-silver">Todavía no hay banners.</p>
            ) : (
              <div className="flex flex-col divide-y divide-ink-border">
                {banners.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- imagen remota del banner */}
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="h-16 w-28 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-bone">{b.title}</p>
                        {b.isActive ? (
                          <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-ink-border text-silver">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      {b.subtitle && <p className="truncate text-sm text-silver">{b.subtitle}</p>}
                      {b.linkUrl && <p className="truncate text-xs text-gold-light">{b.linkUrl}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingBanner(b);
                          setBannerDialogOpen(true);
                        }}
                        aria-label={`Editar ${b.title}`}
                        className="text-silver hover:bg-ink-border hover:text-gold"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setPendingDelete({ kind: "banner", id: b.id })}
                        aria-label={`Eliminar ${b.title}`}
                        className="text-silver hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-silver">{announcements.length} anuncios</p>
            <Button
              onClick={() => {
                setEditingAnnouncement(null);
                setAnnouncementDialogOpen(true);
              }}
              className="bg-gradient-gold text-ink hover:opacity-90"
            >
              <Plus className="size-4" />
              Nuevo anuncio
            </Button>
          </div>
          <div className="rounded-lg border border-ink-border bg-ink-soft">
            {announcementsQuery.isLoading ? (
              <p className="p-6 text-sm text-silver">Cargando anuncios...</p>
            ) : announcements.length === 0 ? (
              <p className="p-6 text-sm text-silver">Todavía no hay anuncios.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Texto</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-bone">{a.text}</TableCell>
                      <TableCell className="text-xs text-gold-light">{a.linkUrl ?? "—"}</TableCell>
                      <TableCell>
                        {a.isActive ? (
                          <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-ink-border text-silver">
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditingAnnouncement(a);
                              setAnnouncementDialogOpen(true);
                            }}
                            aria-label={`Editar ${a.text}`}
                            className="text-silver hover:bg-ink-border hover:text-gold"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setPendingDelete({ kind: "announcement", id: a.id })}
                            aria-label={`Eliminar ${a.text}`}
                            className="text-silver hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}

      <BannerFormDialog
        open={bannerDialogOpen}
        onOpenChange={setBannerDialogOpen}
        banner={editingBanner}
        nextOrder={banners.length}
      />
      <AnnouncementFormDialog
        open={announcementDialogOpen}
        onOpenChange={setAnnouncementDialogOpen}
        announcement={editingAnnouncement}
        nextOrder={announcements.length}
      />

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg border border-ink-border bg-ink-soft p-6">
            <h2 className="font-display text-lg font-semibold text-bone">¿Eliminar?</h2>
            <p className="mt-2 text-sm text-silver">
              {pendingDelete.kind === "banner"
                ? "El banner se va a borrar del home."
                : "El anuncio se va a borrar de la barra superior."}
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
                onClick={() => deleteMutation.mutate(pendingDelete)}
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-ink-border text-gold-light" : "text-silver hover:text-bone"
      )}
    >
      {children}
    </button>
  );
}
