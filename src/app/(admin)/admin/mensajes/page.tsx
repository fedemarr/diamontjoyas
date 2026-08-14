"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Mail, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { contactMessagesApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export default function MensajesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isRead, setIsRead] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["messages", { q: debouncedSearch, isRead, page }],
    queryFn: () =>
      contactMessagesApi.list({
        q: debouncedSearch || undefined,
        isRead: isRead === "all" ? undefined : isRead,
        page,
      }),
  });

  const setReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      contactMessagesApi.setRead(id, isRead),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactMessagesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setPendingDelete(null);
    },
  });

  const messages = data?.messages ?? [];

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    const msg = messages.find((m) => m.id === id);
    if (msg && !msg.isRead) {
      setReadMutation.mutate({ id, isRead: true });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-bone">Mensajes de contacto</h1>
        <p className="text-sm text-silver">
          {data?.unread ?? 0} sin leer · {data?.total ?? 0} en total
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => setDebouncedSearch(search)}
          placeholder="Buscar por nombre, email o mensaje..."
          className="max-w-xs border-ink-border bg-ink-soft text-bone placeholder:text-silver/70"
        />
        <Select value={isRead} onValueChange={setIsRead}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="false">Sin leer</SelectItem>
            <SelectItem value="true">Leídos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-ink-border bg-ink-soft">
        {isLoading ? (
          <p className="p-6 text-sm text-silver">Cargando mensajes...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-danger">No se pudieron cargar los mensajes.</p>
        ) : messages.length === 0 ? (
          <p className="p-6 text-sm text-silver">
            No hay mensajes. El formulario de /contacto llega acá.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-ink-border">
            {messages.map((m) => {
              const open = expanded.has(m.id);
              return (
                <div key={m.id} className={cn("p-4", !m.isRead && "bg-gold/5")}>
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ink-border bg-ink">
                      <Mail className="size-4 text-gold" />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(m.id)}
                      className="min-w-0 flex-1 text-left"
                      aria-expanded={open}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("font-medium", m.isRead ? "text-bone" : "text-gold-light")}>
                          {m.name}
                        </span>
                        {!m.isRead && (
                          <Badge variant="outline" className="border-gold/40 bg-gold/10 text-gold-light">
                            Nuevo
                          </Badge>
                        )}
                        <span className="ml-auto text-xs text-silver">
                          {new Date(m.createdAt).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-silver">
                        {m.email}
                        {m.phone ? ` · ${m.phone}` : ""}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-bone/90">{m.message}</p>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-gold-light">
                        {open ? "Ocultar" : "Leer mensaje"}
                        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
                      </span>
                    </button>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setReadMutation.mutate({ id: m.id, isRead: !m.isRead })}
                        aria-label={m.isRead ? "Marcar como no leído" : "Marcar como leído"}
                        className="text-silver hover:bg-ink-border hover:text-gold"
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setPendingDelete(m.id)}
                        aria-label="Eliminar mensaje"
                        className="text-silver hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {open && (
                    <div className="mt-3 rounded-md border border-ink-border bg-ink p-4 text-sm text-bone">
                      {m.message}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-silver">
            Página {data.page} de {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-ink-border bg-transparent text-bone"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-ink-border bg-transparent text-bone"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg border border-ink-border bg-ink-soft p-6">
            <h2 className="font-display text-lg font-semibold text-bone">¿Eliminar mensaje?</h2>
            <p className="mt-2 text-sm text-silver">Esta acción no se puede deshacer.</p>
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
