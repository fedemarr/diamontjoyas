"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Download, Pencil, Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CsvImportDialog } from "@/app/(admin)/admin/productos/csv-import-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoriesApi, productsApi } from "@/lib/admin-api";
import { formatARS } from "@/lib/format";

const MATERIAL_LABELS: Record<string, string> = {
  ORO_18K: "Oro 18k",
  ORO_BAJO: "Oro bajo",
  ENCHAPADO: "Enchapado",
  PLATA_925: "Plata 925",
};

export default function ProductosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [material, setMaterial] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, categoryId, material, statusFilter, sort]);

  const { data: categoriesData } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { q: debouncedSearch, categoryId, material, statusFilter, sort, page }],
    queryFn: () =>
      productsApi.list({
        q: debouncedSearch || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
        material: material === "all" ? undefined : material,
        isActive: statusFilter === "all" ? undefined : statusFilter,
        sort,
        page,
        pageSize: 20,
      }),
  });

  const products = data?.products ?? [];
  const categories = categoriesData?.categories ?? [];

  const bulkMutation = useMutation({
    mutationFn: ({ action }: { action: "activate" | "deactivate" | "delete" }) =>
      productsApi.bulk(Array.from(selected), action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelected(new Set());
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => productsApi.duplicate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setPendingDeleteId(null);
    },
  });

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(products.map((p) => p.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-bone">Productos</h1>
          <p className="text-sm text-silver">{data?.total ?? 0} productos en el catálogo</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="border-ink-border bg-transparent text-bone"
          >
            <Upload className="size-4" />
            Importar CSV
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-ink-border bg-transparent text-bone"
          >
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- descarga de archivo, no navegación */}
            <a href="/api/admin/products/export">
              <Download className="size-4" />
              Exportar CSV
            </a>
          </Button>
          <Button asChild className="bg-gradient-gold text-ink hover:opacity-90">
            <Link href="/admin/productos/nuevo">
              <Plus className="size-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="max-w-xs border-ink-border bg-ink-soft text-bone placeholder:text-silver/70"
        />
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={material} onValueChange={setMaterial}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Material" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los materiales</SelectItem>
            {Object.entries(MATERIAL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Orden" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más nuevos</SelectItem>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
            <SelectItem value="price">Precio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-gold/30 bg-gold/5 px-4 py-2.5">
          <span className="text-sm text-bone">{selected.size} seleccionados</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => bulkMutation.mutate({ action: "activate" })}
            className="border-ink-border bg-transparent text-bone"
          >
            Activar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => bulkMutation.mutate({ action: "deactivate" })}
            className="border-ink-border bg-transparent text-bone"
          >
            Desactivar
          </Button>
          <Button
            size="sm"
            onClick={() => bulkMutation.mutate({ action: "delete" })}
            className="bg-danger text-white hover:bg-danger/90"
          >
            Eliminar
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-ink-border bg-ink-soft">
        {isLoading ? (
          <p className="p-6 text-sm text-silver">Cargando productos...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-danger">No se pudieron cargar los productos.</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-silver">No hay productos con estos filtros.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={selected.size === products.length && products.length > 0}
                    onCheckedChange={(v) => toggleAll(!!v)}
                  />
                </TableHead>
                <TableHead />
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={(v) => toggleOne(p.id, !!v)}
                    />
                  </TableCell>
                  <TableCell>
                    {p.images[0] ? (
                      <div className="relative size-10 overflow-hidden rounded-md bg-ink">
                        <Image src={p.images[0].url} alt={p.images[0].alt} fill sizes="40px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="size-10 rounded-md bg-ink" />
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-bone">{p.name}</p>
                    <p className="text-xs text-silver">{p.sku}</p>
                  </TableCell>
                  <TableCell className="text-silver">{p.category?.name ?? "—"}</TableCell>
                  <TableCell className="text-silver">{MATERIAL_LABELS[p.material] ?? p.material}</TableCell>
                  <TableCell className="text-bone">{formatARS(p.currentPrice)}</TableCell>
                  <TableCell className={p.stock <= p.lowStockAlert ? "text-danger" : "text-silver"}>
                    {p.stock}
                  </TableCell>
                  <TableCell>
                    {p.isActive ? (
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
                        asChild
                        aria-label={`Editar ${p.name}`}
                        className="text-silver hover:bg-ink-border hover:text-gold"
                      >
                        <Link href={`/admin/productos/${p.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => duplicateMutation.mutate(p.id)}
                        aria-label={`Duplicar ${p.name}`}
                        className="text-silver hover:bg-ink-border hover:text-gold"
                      >
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setPendingDeleteId(p.id)}
                        aria-label={`Eliminar ${p.name}`}
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

      <CsvImportDialog open={importOpen} onOpenChange={setImportOpen} />

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg border border-ink-border bg-ink-soft p-6">
            <h2 className="font-display text-lg font-semibold text-bone">¿Eliminar producto?</h2>
            <p className="mt-2 text-sm text-silver">
              No se borra de verdad — queda desactivado y oculto de la tienda.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPendingDeleteId(null)}
                className="border-ink-border bg-transparent text-bone"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => deleteMutation.mutate(pendingDeleteId)}
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
