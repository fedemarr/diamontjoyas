import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/app/(admin)/admin/productos/product-form";
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/serialize";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditarProductoPage({
  params,
}: PageProps<"/admin/productos/[id]">) {
  const { id } = await params;
  const product = await db.product.findFirst({
    where: { id, deletedAt: null },
    include: { images: true, variants: true, category: true },
  });

  if (!product) notFound();

  const serialized = serializeProduct(product);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-bone">Editar producto</h1>
      <ProductForm
        product={{
          ...serialized,
          createdAt: serialized.createdAt.toISOString(),
          updatedAt: serialized.updatedAt.toISOString(),
        }}
      />
    </div>
  );
}
