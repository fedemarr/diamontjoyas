"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/**
 * Modal promocional del home ("como publicidad") — admin-editable desde
 * Configuración → Popup. Se guarda en Settings (no un modelo propio) y se
 * "cierra" por visitante vía localStorage, con clave atada al contenido:
 * si el admin cambia título/mensaje, vuelve a aparecer aunque ya lo hayan
 * cerrado antes con el texto viejo.
 */
export function PromoPopup({
  enabled,
  title,
  message,
  imageUrl,
  linkUrl,
  buttonText,
}: {
  enabled: boolean;
  title: string;
  message: string;
  imageUrl: string | null;
  linkUrl: string | null;
  buttonText: string;
}) {
  const [open, setOpen] = useState(false);
  const hasContent = enabled && (title.trim() || message.trim());
  const dismissKey = `dva-popup-dismissed:${title}|${message}`;

  useEffect(() => {
    if (!hasContent) return;
    try {
      if (localStorage.getItem(dismissKey) === "1") return;
    } catch {
      // localStorage puede fallar (modo privado, etc.) — mostramos igual.
    }
    const id = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(id);
  }, [hasContent, dismissKey]);

  function handleClose() {
    setOpen(false);
    try {
      localStorage.setItem(dismissKey, "1");
    } catch {
      // sin persistencia disponible, no pasa nada — solo vuelve a mostrarse antes de tiempo.
    }
  }

  if (!hasContent) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm border-ink-border bg-ink-soft p-0 text-bone sm:max-w-md">
        {imageUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
            <Image src={imageUrl} alt={title || "Promoción"} fill className="object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-3 p-6 text-center">
          <DialogTitle
            className={
              title
                ? "font-display text-xl font-semibold text-bone"
                : "sr-only"
            }
          >
            {title || "Promoción"}
          </DialogTitle>
          {message && <DialogDescription className="text-sm text-silver">{message}</DialogDescription>}

          {linkUrl && (
            <Button
              asChild
              className="mt-2 bg-gradient-gold text-ink hover:opacity-90"
              onClick={handleClose}
            >
              <Link href={linkUrl}>{buttonText || "Ver más"}</Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
