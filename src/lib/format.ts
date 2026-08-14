const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatARS(value: number | null | undefined): string {
  if (value == null) return "—";
  return arsFormatter.format(value);
}
