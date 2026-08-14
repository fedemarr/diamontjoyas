"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Coins, History } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { goldPriceApi } from "@/lib/admin-api";
import { formatARS } from "@/lib/format";
import type { GoldPricePreviewItem } from "@/types/admin";

const MATERIAL_LABELS: Record<string, string> = {
  ORO_18K: "Oro 18k",
  ORO_BAJO: "Oro bajo",
};

export default function PrecioOroPage() {
  const queryClient = useQueryClient();
  const [gram18k, setGram18k] = useState("");
  const [gramLow, setGramLow] = useState("");
  const [preview, setPreview] = useState<GoldPricePreviewItem[] | null>(null);
  const [applied, setApplied] = useState(false);

  const { data: current, isLoading } = useQuery({
    queryKey: ["gold-price"],
    queryFn: goldPriceApi.current,
  });

  // TanStack Query v5 sacó el callback onSuccess de useQuery — se
  // precargan los inputs con un efecto en vez de eso, una sola vez.
  useEffect(() => {
    if (!current) return;
    setGram18k((v) => v || String(current.goldPricePerGram18k));
    setGramLow((v) => v || String(current.goldPricePerGramLow));
  }, [current]);

  const { data: history } = useQuery({
    queryKey: ["gold-price-history"],
    queryFn: goldPriceApi.history,
  });

  const previewMutation = useMutation({
    mutationFn: () =>
      goldPriceApi.preview({
        goldPricePerGram18k: Number(gram18k),
        goldPricePerGramLow: Number(gramLow),
      }),
    onSuccess: (data) => {
      setPreview(data.items);
      setApplied(false);
    },
  });

  const applyMutation = useMutation({
    mutationFn: () =>
      goldPriceApi.apply({
        goldPricePerGram18k: Number(gram18k),
        goldPricePerGramLow: Number(gramLow),
      }),
    onSuccess: () => {
      setApplied(true);
      setPreview(null);
      queryClient.invalidateQueries({ queryKey: ["gold-price"] });
      queryClient.invalidateQueries({ queryKey: ["gold-price-history"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-bone">
          <Coins className="size-6 text-gold" />
          Precio del oro
        </h1>
        <p className="text-sm text-silver">
          Actualizá acá el valor del gramo y se recalculan solos todos los productos &quot;por
          peso&quot;.
        </p>
      </div>

      <div className="grid gap-6 rounded-lg border border-ink-border bg-ink-soft p-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label className="text-base text-bone">Oro 18k — precio por gramo</Label>
          <Input
            type="number"
            value={gram18k}
            onChange={(e) => setGram18k(e.target.value)}
            className="h-14 border-ink-border bg-ink text-2xl font-semibold text-bone"
          />
          <p className="text-xs text-silver">
            Afecta {current?.affectedCount18k ?? "…"} producto(s) actualmente.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base text-bone">Oro bajo — precio por gramo</Label>
          <Input
            type="number"
            value={gramLow}
            onChange={(e) => setGramLow(e.target.value)}
            className="h-14 border-ink-border bg-ink text-2xl font-semibold text-bone"
          />
          <p className="text-xs text-silver">
            Afecta {current?.affectedCountLow ?? "…"} producto(s) actualmente.
          </p>
        </div>

        <div className="col-span-full flex flex-wrap items-center gap-3">
          <Button
            onClick={() => previewMutation.mutate()}
            disabled={isLoading || !gram18k || !gramLow || previewMutation.isPending}
            className="bg-gradient-gold text-ink hover:opacity-90"
          >
            Ver cambios antes de aplicar
          </Button>
          {applied && (
            <span className="text-sm text-success">✔ Precios actualizados correctamente.</span>
          )}
        </div>
      </div>

      {preview && (
        <div className="flex flex-col gap-3 rounded-lg border border-gold/30 bg-gold/5 p-6">
          <h2 className="font-display text-lg font-semibold text-bone">
            Vista previa — {preview.length} producto(s) afectados
          </h2>

          {preview.length === 0 ? (
            <p className="text-sm text-silver">
              No hay productos &quot;por peso&quot; con estos materiales todavía.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto rounded-md border border-ink-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Precio actual</TableHead>
                    <TableHead />
                    <TableHead>Precio nuevo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-silver">
                        {MATERIAL_LABELS[item.material] ?? item.material}
                      </TableCell>
                      <TableCell className="text-silver">{formatARS(item.oldPrice)}</TableCell>
                      <TableCell>
                        <ArrowRight className="size-4 text-silver" />
                      </TableCell>
                      <TableCell
                        className={
                          item.newPrice > item.oldPrice
                            ? "font-medium text-success"
                            : item.newPrice < item.oldPrice
                              ? "font-medium text-danger"
                              : "text-bone"
                        }
                      >
                        {formatARS(item.newPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPreview(null)}
              className="border-ink-border bg-transparent text-bone"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending}
              className="bg-gradient-gold text-ink hover:opacity-90"
            >
              Confirmar y actualizar precios
            </Button>
          </div>

          {applyMutation.isError && (
            <p role="alert" className="text-sm text-danger">
              {(applyMutation.error as Error).message}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-bone">
          <History className="size-5 text-gold" />
          Historial de cambios
        </h2>
        {!history || history.history.length === 0 ? (
          <p className="text-sm text-silver">Todavía no hay cambios registrados.</p>
        ) : (
          <div className="rounded-lg border border-ink-border bg-ink-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Oro 18k</TableHead>
                  <TableHead>Oro bajo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-silver">
                      {new Date(h.createdAt).toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-silver">{h.user?.name ?? "—"}</TableCell>
                    <TableCell>
                      {formatARS(h.changes.before.goldPricePerGram18k)} →{" "}
                      <span className="text-gold-light">
                        {formatARS(h.changes.after.goldPricePerGram18k)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatARS(h.changes.before.goldPricePerGramLow)} →{" "}
                      <span className="text-gold-light">
                        {formatARS(h.changes.after.goldPricePerGramLow)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
