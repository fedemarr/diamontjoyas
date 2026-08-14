/**
 * Sanitización de texto libre (sección 8 del prompt maestro). React escapa
 * el texto por defecto, pero los textos editables (descripciones, mensajes)
 * pasan por acá antes de renderizarse en el storefront para quitar etiquetas
 * HTML y caracteres de control que no aportan nada y rompen el layout.
 */
const TAG_REGEX = /<\/?[a-z][^>]*>/gi;
const CONTROL_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeText(value: string): string {
  return value.replace(TAG_REGEX, "").replace(CONTROL_REGEX, "").trim();
}

/**
 * Texto de usuario dentro de un bloque `<script type="application/ld+json">`
 * (JSON-LD): `JSON.stringify` no escapa `<`, y un `</script>` inyectado
 * podría cerrar el tag. Escaparlo como `\u003c` mantiene el JSON válido y
 * mata el vector.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
