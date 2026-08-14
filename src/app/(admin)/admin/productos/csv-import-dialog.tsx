"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { productsApi } from "@/lib/admin-api";
import type { ImportResult } from "@/types/admin";

export function CsvImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const mutation = useMutation({
    mutationFn: (csv: string) => productsApi.importCsv(csv),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  async function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    const text = await file.text();
    mutation.mutate(text);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setResult(null);
          setFileName(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar productos por CSV</DialogTitle>
          <DialogDescription>
            Crea productos nuevos o actualiza los existentes (por SKU). No carga imágenes ni
            variantes — eso se hace desde la ficha de cada producto.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="border-ink-border bg-transparent text-bone"
          >
            <Upload className="size-4" />
            {fileName ?? "Elegir archivo CSV"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <p className="text-xs text-silver">
            Columnas esperadas: sku, name, slug, categorySlug, material, pricingMode, price,
            weightGrams, laborCost, compareAtPrice, cost, stock, lowStockAlert, trackStock,
            isActive, isFeatured, description.
          </p>

          {mutation.isPending && <p className="text-sm text-silver">Importando...</p>}

          {mutation.isError && (
            <p role="alert" className="text-sm text-danger">
              {(mutation.error as Error).message}
            </p>
          )}

          {result && (
            <div className="rounded-md border border-ink-border bg-ink p-3 text-sm">
              <p className="text-bone">
                <span className="text-success">{result.created} creados</span> ·{" "}
                <span className="text-gold-light">{result.updated} actualizados</span> ·{" "}
                <span className={result.errors.length ? "text-danger" : "text-silver"}>
                  {result.errors.length} errores
                </span>
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-silver">
                  {result.errors.map((e, i) => (
                    <li key={i}>
                      Fila {e.row} {e.sku ? `(${e.sku})` : ""}: {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-gradient-gold text-ink hover:opacity-90"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
