import type { Metadata } from "next";

import { ProductForm } from "@/app/(admin)/admin/productos/product-form";

export const metadata: Metadata = { title: "Nuevo producto" };

export default function NuevoProductoPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-bone">Nuevo producto</h1>
      <ProductForm />
    </div>
  );
}
