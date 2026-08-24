import { Package, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/app/(shop)/cuenta/sign-out-button";
import { PaymentStatusBadge } from "@/components/shop/order-status";
import { auth } from "@/lib/auth";
import { formatARS } from "@/lib/format";
import { getOrdersByCustomerId } from "@/lib/queries/orders";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const session = await auth();
  if (session?.user?.kind !== "customer") {
    redirect("/cuenta/ingresar");
  }

  const orders = await getOrdersByCustomerId(session.user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-luxury text-gold-light uppercase">Mi cuenta</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-bone">
            Hola, {session.user.name?.split(" ")[0] ?? "!"}
          </h1>
          <p className="mt-1 text-sm text-silver">{session.user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-md border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-gold-light">
        <ShoppingBag className="size-4 shrink-0" />
        Estando logueado tenés <span className="font-semibold">5% off</span> en cada compra (no se
        combina con cupones).
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-bone">
          <Package className="size-5 text-gold" />
          Mis pedidos
        </h2>

        {orders.length === 0 ? (
          <div className="rounded-lg border border-ink-border bg-ink-soft p-6 text-center">
            <p className="text-sm text-silver">Todavía no hiciste ninguna compra logueado.</p>
            <Link href="/tienda" className="mt-3 inline-block text-sm text-gold-light hover:underline">
              Ir a la tienda →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-ink-border rounded-lg border border-ink-border bg-ink-soft">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/seguimiento/${order.publicCode}`}
                className="flex flex-col gap-2 p-4 transition-colors hover:bg-ink sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-bone">{order.orderNumber}</p>
                  <p className="text-xs text-silver">
                    {new Date(order.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {order.items.reduce((n, i) => n + i.quantity, 0)} producto(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <span className="font-semibold text-gold-light">
                    {formatARS(order.total.toNumber())}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
