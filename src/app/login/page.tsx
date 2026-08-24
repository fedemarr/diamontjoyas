import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Ingresar",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.kind === "admin") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-semibold tracking-wide text-bone">
            DIAMOND<span className="text-gradient-gold">VA.Co</span>
          </span>
          <p className="mt-2 text-xs font-semibold tracking-luxury text-silver uppercase">
            Panel de administración
          </p>
        </div>

        <div className="rounded-lg border border-ink-border bg-ink-soft p-6 sm:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
