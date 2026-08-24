import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CustomerLoginForm } from "@/app/(shop)/cuenta/ingresar/customer-login-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Ingresar" };

export default async function CuentaIngresarPage() {
  const session = await auth();
  if (session?.user?.kind === "customer") {
    redirect("/cuenta");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-bone">Ingresá a tu cuenta</h1>
        <p className="mt-2 text-sm text-silver">
          Iniciá sesión y llevate <span className="text-gold-light">5% off</span> en tu próxima compra.
        </p>
      </div>

      <div className="rounded-lg border border-ink-border bg-ink-soft p-6 sm:p-8">
        <CustomerLoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-silver">
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/cuenta/registro" className="text-gold-light hover:underline">
          Creá una gratis
        </Link>
      </p>
    </div>
  );
}
