import { CreditCard, ShieldCheck, Truck } from "lucide-react";

export function TrustBadges({
  installmentsEnabled,
  installmentsCount,
}: {
  installmentsEnabled: boolean;
  installmentsCount: number;
}) {
  const items = [
    { icon: Truck, text: "Envíos a todo el país" },
    {
      icon: CreditCard,
      text: installmentsEnabled
        ? `Mercado Pago en hasta ${installmentsCount} cuotas`
        : "Mercado Pago",
    },
    { icon: ShieldCheck, text: "Garantía y calidad" },
  ];

  return (
    <section className="border-b border-ink-border bg-ink-soft/60">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.text} className="flex items-center justify-center gap-3 text-center sm:justify-start">
            <item.icon className="size-5 shrink-0 text-gold" strokeWidth={1.5} />
            <span className="text-sm font-medium text-silver">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
