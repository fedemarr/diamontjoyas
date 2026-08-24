import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CustomerRegisterForm } from "@/app/(shop)/cuenta/registro/customer-register-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function CuentaRegistroPage() {
  const session = await auth();
  if (session?.user?.kind === "customer") {
    redirect("/cuenta");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-bone">Creá tu cuenta</h1>
        <p className="mt-2 text-sm text-silver">
          Registrate y llevate <span className="text-gold-light">5% off</span> en tus compras (no
          combinable con cupones).
        </p>
      </div>

      <div className="rounded-lg border border-ink-border bg-ink-soft p-6 sm:p-8">
        <CustomerRegisterForm />
      </div>

      <p className="mt-6 text-center text-sm text-silver">
        ¿Ya tenés cuenta?{" "}
        <Link href="/cuenta/ingresar" className="text-gold-light hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
