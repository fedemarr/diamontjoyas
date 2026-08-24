"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  customerRegisterSchema,
  type CustomerRegisterInput,
} from "@/lib/validations/customer-auth";

export function CustomerRegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerRegisterInput>({
    resolver: zodResolver(customerRegisterSchema),
  });

  async function onSubmit(data: CustomerRegisterInput) {
    setFormError(null);

    const res = await fetch("/api/cuenta/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setFormError(body?.error ?? "No se pudo crear la cuenta. Probá de nuevo.");
      return;
    }

    const result = await signIn("customer-login", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (!result || result.error) {
      // La cuenta se creó igual — mandamos a login por si el auto-login falla.
      router.push("/cuenta/ingresar");
      return;
    }

    router.push("/cuenta");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-bone">
          Nombre completo
        </Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Ej: María Pérez"
          className="border-ink-border bg-ink text-bone placeholder:text-silver/70 focus-visible:border-gold focus-visible:ring-gold/40"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-bone">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          className="border-ink-border bg-ink text-bone placeholder:text-silver/70 focus-visible:border-gold focus-visible:ring-gold/40"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone" className="text-bone">
          Teléfono <span className="text-silver">(opcional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Ej: 11 2345-6789"
          className="border-ink-border bg-ink text-bone placeholder:text-silver/70 focus-visible:border-gold focus-visible:ring-gold/40"
          {...register("phone")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-bone">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          className="border-ink-border bg-ink text-bone focus-visible:border-gold focus-visible:ring-gold/40"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
      </div>

      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="bg-gradient-gold text-ink hover:opacity-90">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          "Crear cuenta"
        )}
      </Button>
    </form>
  );
}
