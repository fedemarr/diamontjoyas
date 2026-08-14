import { describe, expect, it } from "vitest";

import { calculateShippingCost, type ShippingRates } from "@/lib/shipping";

const rates: ShippingRates = { amba: 4500, interior: 7500, retiroLocal: 0 };

describe("calculateShippingCost", () => {
  it("retiro en local siempre es $0, sin importar la provincia", () => {
    expect(calculateShippingCost("RETIRO_LOCAL", "Buenos Aires", rates)).toBe(0);
    expect(calculateShippingCost("RETIRO_LOCAL", "Salta", rates)).toBe(0);
    expect(calculateShippingCost("RETIRO_LOCAL", null, rates)).toBe(0);
  });

  it("Buenos Aires y CABA usan la tarifa AMBA", () => {
    expect(calculateShippingCost("ENVIO_DOMICILIO", "Buenos Aires", rates)).toBe(4500);
    expect(calculateShippingCost("ENVIO_DOMICILIO", "CABA", rates)).toBe(4500);
  });

  it("el resto de las provincias usa la tarifa interior", () => {
    expect(calculateShippingCost("SUCURSAL_CORREO", "Córdoba", rates)).toBe(7500);
    expect(calculateShippingCost("SUCURSAL_CORREO", "Salta", rates)).toBe(7500);
  });

  it("sin provincia elegida todavía, cae a la tarifa interior (no subestima el envío)", () => {
    expect(calculateShippingCost("ENVIO_DOMICILIO", null, rates)).toBe(7500);
  });

  it("sin Settings cargados, no rompe — devuelve 0", () => {
    expect(calculateShippingCost("ENVIO_DOMICILIO", "Buenos Aires", null)).toBe(0);
  });
});
