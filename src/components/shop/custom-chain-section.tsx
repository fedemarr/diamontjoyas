"use client";

import { MessageCircle, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const materialOptions = [
  { value: "ORO_18K", label: "Oro 18k" },
  { value: "ORO_BAJO", label: "Oro bajo" },
  { value: "ENCHAPADO", label: "Enchapado" },
  { value: "PLATA_925", label: "Plata 925" },
];

export function CustomChainSection() {
  const [material, setMaterial] = useState("");
  const [length, setLength] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const materialLabel = materialOptions.find((m) => m.value === material)?.label ?? material;

    const lines = [
      "Hola! Quiero cotizar una *cadena personalizada*",
      "",
      name ? `Nombre: ${name}` : "",
      material ? `Material: ${materialLabel}` : "",
      length ? `Largo aproximado: ${length}cm` : "",
      description ? `Descripción: ${description}` : "",
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/5491100000000?text=${text}`, "_blank");
  }

  return (
    <section className="relative overflow-hidden border-y border-gold/20 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.06),transparent_60%)]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-gold">
            <LinkIcon className="size-4" strokeWidth={1.5} />
            <span className="text-xs font-semibold tracking-luxury uppercase">
              Cadena personalizada
            </span>
          </div>

          <h2 className="font-display text-3xl font-semibold leading-tight text-bone md:text-4xl">
            Diseñá tu cadena a medida
          </h2>

          <p className="mt-4 text-base text-silver">
            Elegí el material, el largo y contanos qué tenés en mente. Te la cotizamos sin compromiso por WhatsApp.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 grid max-w-lg gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label htmlFor="chain-name" className="mb-1 block text-xs font-medium text-silver">
              Tu nombre
            </label>
            <Input
              id="chain-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María"
              className="border-ink-border bg-ink-soft text-bone placeholder:text-silver/60 focus-visible:border-gold focus-visible:ring-gold/40"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="chain-material" className="mb-1 block text-xs font-medium text-silver">
              Material
            </label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger
                id="chain-material"
                className="border-ink-border bg-ink-soft text-bone focus:border-gold focus:ring-gold/40"
              >
                <SelectValue placeholder="Elegí un material" />
              </SelectTrigger>
              <SelectContent className="border-ink-border bg-ink text-bone">
                {materialOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="chain-length" className="mb-1 block text-xs font-medium text-silver">
              Largo aproximado (cm)
            </label>
            <Input
              id="chain-length"
              type="number"
              min={20}
              max={100}
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="Ej: 50"
              className="border-ink-border bg-ink-soft text-bone placeholder:text-silver/60 focus-visible:border-gold focus-visible:ring-gold/40"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="chain-desc" className="mb-1 block text-xs font-medium text-silver">
              ¿Qué tenés en mente?
            </label>
            <Textarea
              id="chain-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Una cadena tipo fígaro, eslabones medium, con cierreTexto tipo lobster..."
              rows={3}
              className="border-ink-border bg-ink-soft text-bone placeholder:text-silver/60 focus-visible:border-gold focus-visible:ring-gold/40"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-gold text-ink hover:opacity-90 gap-2"
            >
              <MessageCircle className="size-4" />
              Cotizar por WhatsApp
            </Button>
            <p className="text-center text-xs text-silver/60">
              Te respondemos a la brevedad con el precio y el tiempo estimado.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}