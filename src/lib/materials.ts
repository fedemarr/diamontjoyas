export const MATERIAL_LABELS: Record<string, string> = {
  ORO_18K: "Oro 18k",
  ORO_BAJO: "Oro bajo",
  ENCHAPADO: "Enchapado",
  PLATA_925: "Plata 925",
};

export const MATERIAL_OPTIONS = Object.entries(MATERIAL_LABELS).map(([value, label]) => ({
  value,
  label,
}));
