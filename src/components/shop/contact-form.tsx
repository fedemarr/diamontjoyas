"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, MessageCircle, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildWhatsappUrl } from "@/lib/queries/settings";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/validations/contact";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ContactForm({
  whatsapp,
  email,
  address,
  businessHours,
  instagram,
}: {
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  businessHours: string | null;
  instagram: string | null;
}) {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      website: "",
    },
  });

  async function onSubmit(data: ContactMessageInput) {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "No se pudo enviar el mensaje.");
      }
      setSent(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo enviar el mensaje.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-success/40 bg-success/5 p-10 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <h2 className="font-display text-xl font-semibold text-bone">Mensaje enviado</h2>
        <p className="max-w-sm text-sm text-silver">
          ¡Gracias por escribirnos! Te respondemos a la brevedad. Si es urgente, escribinos por
          WhatsApp.
        </p>
        {whatsapp && (
          <Button
            asChild
            variant="outline"
            className="border-ink-border bg-transparent text-bone hover:border-success hover:text-success"
          >
            <a href={buildWhatsappUrl(whatsapp, "Hola! Quería hacerles una consulta") ?? "#"} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" />
              Escribinos por WhatsApp
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nombre y apellido</Label>
          <Input
            id="name"
            autoComplete="name"
            {...register("name")}
            className="border-ink-border bg-ink text-bone"
          />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="border-ink-border bg-ink text-bone"
          />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Teléfono (opcional)</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          {...register("phone")}
          placeholder="11 1234-5678"
          className="border-ink-border bg-ink text-bone"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Mensaje</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="¿Sobre qué pieza o consulta querés escribirnos?"
          {...register("message")}
          className="border-ink-border bg-ink text-bone"
        />
        {errors.message && <p className="text-xs text-danger">{errors.message.message}</p>}
      </div>

      {/* Honeypot anti-spam — oculto para humanos (sección 8 del prompt). */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">No completar</Label>
        <Input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-danger">
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="bg-gradient-gold text-ink hover:opacity-90"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar mensaje"
        )}
      </Button>

      <div className="mt-2 flex flex-col gap-2 border-t border-ink-border pt-4 text-sm text-silver">
        {address && (
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-gold" />
            {address}
          </p>
        )}
        {businessHours && (
          <p className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-gold" />
            {businessHours}
          </p>
        )}
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-gold"
          >
            <InstagramIcon className="size-4 shrink-0 text-gold" />
            @diamondva.co
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="transition-colors hover:text-gold">
            {email}
          </a>
        )}
      </div>
    </form>
  );
}
