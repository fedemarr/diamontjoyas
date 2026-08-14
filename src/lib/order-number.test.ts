import { describe, expect, it } from "vitest";

import { formatOrderNumber, generatePublicCode } from "@/lib/order-number";

describe("formatOrderNumber", () => {
  it("rellena con ceros a la izquierda hasta 6 dígitos", () => {
    expect(formatOrderNumber(123)).toBe("DVA-000123");
  });

  it("no trunca si el número ya tiene 6 o más dígitos", () => {
    expect(formatOrderNumber(1234567)).toBe("DVA-1234567");
  });

  it("funciona con el primer pedido", () => {
    expect(formatOrderNumber(1)).toBe("DVA-000001");
  });
});

describe("generatePublicCode", () => {
  it("genera códigos de la longitud pedida", () => {
    expect(generatePublicCode(8)).toHaveLength(8);
    expect(generatePublicCode(12)).toHaveLength(12);
  });

  it("no usa caracteres ambiguos (0/O/1/I)", () => {
    const codes = Array.from({ length: 200 }, () => generatePublicCode());
    const joined = codes.join("");
    expect(joined).not.toMatch(/[0O1I]/);
  });

  it("prácticamente nunca repite (al azar, alta entropía)", () => {
    const codes = new Set(Array.from({ length: 500 }, () => generatePublicCode()));
    expect(codes.size).toBe(500);
  });
});
