import { randomBytes } from "crypto";

/** DVA-000123 — se arma después del insert, con el `orderSeq` autoincrement de Postgres. */
export function formatOrderNumber(orderSeq: number): string {
  return `DVA-${String(orderSeq).padStart(6, "0")}`;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I, para que se lea bien

/** Código público al azar para /seguimiento/[code] — no debe ser adivinable/enumerable. */
export function generatePublicCode(length = 8): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}
