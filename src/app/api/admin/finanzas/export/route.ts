import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { getFinanceExportRows } from "@/lib/finanzas";

function csvCell(value: unknown): string {
  const str = value == null ? "" : String(value);
  // RFC 4180: escapar comillas y encerrar entre comillas si hace falta.
  if (/[",;\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(request: NextRequest) {
  const { response } = await requireSession();
  if (response) return response;

  const params = request.nextUrl.searchParams;
  const to = params.get("to") ? new Date(params.get("to")!) : new Date();
  const from = params.get("from")
    ? new Date(params.get("from")!)
    : new Date(to.getTime() - 30 * 86_400_000);

  const rows = await getFinanceExportRows(from, to);

  const header = [
    "Pedido",
    "Fecha",
    "Método de pago",
    "Estado de pago",
    "Estado del pedido",
    "Cliente",
    "Producto",
    "SKU",
    "Cantidad",
    "Precio unitario",
    "Subtotal línea",
    "Costo línea",
    "Margen línea",
  ];

  const csv = [header, ...rows.map((r) => [r.orderNumber, r.date, r.paymentMethod, r.paymentStatus, r.orderStatus, r.customer, r.product, r.sku, r.quantity, r.unitPrice, r.lineSubtotal, r.lineCost, r.lineMargin].map(csvCell))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="diamondva-finanzas-${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}.csv"`,
    },
  });
}
