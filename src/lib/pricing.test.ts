import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  getGoldPricePerGram,
  getProductPrice,
  PricingError,
  roundUpToHundred,
  type GoldPrices,
} from "@/lib/pricing";

const goldPrices: GoldPrices = {
  goldPricePerGram18k: new Prisma.Decimal(95000),
  goldPricePerGramLow: new Prisma.Decimal(38000),
};

describe("roundUpToHundred", () => {
  it("redondea hacia arriba a la centena más cercana", () => {
    expect(roundUpToHundred(new Prisma.Decimal(50101)).toNumber()).toBe(50200);
  });

  it("no cambia un valor que ya es múltiplo de 100", () => {
    expect(roundUpToHundred(new Prisma.Decimal(50000)).toNumber()).toBe(50000);
  });

  it("redondea hacia arriba aunque falte 1 centavo", () => {
    expect(roundUpToHundred(new Prisma.Decimal(99.01)).toNumber()).toBe(100);
  });

  it("redondea 0 a 0", () => {
    expect(roundUpToHundred(new Prisma.Decimal(0)).toNumber()).toBe(0);
  });
});

describe("getGoldPricePerGram", () => {
  it("devuelve el precio de ORO_18K", () => {
    expect(getGoldPricePerGram("ORO_18K", goldPrices).toNumber()).toBe(95000);
  });

  it("devuelve el precio de ORO_BAJO", () => {
    expect(getGoldPricePerGram("ORO_BAJO", goldPrices).toNumber()).toBe(38000);
  });

  it("rechaza materiales sin precio por gramo configurado", () => {
    expect(() => getGoldPricePerGram("PLATA_925", goldPrices)).toThrow(PricingError);
  });
});

describe("getProductPrice — FIXED", () => {
  it("devuelve el price redondeado a la centena", () => {
    const price = getProductPrice(
      { pricingMode: "FIXED", material: "ENCHAPADO", price: 45050 },
      goldPrices
    );
    expect(price.toNumber()).toBe(45100);
  });

  it("lanza PricingError si falta price", () => {
    expect(() =>
      getProductPrice({ pricingMode: "FIXED", material: "ENCHAPADO" }, goldPrices)
    ).toThrow(PricingError);
  });
});

describe("getProductPrice — BY_WEIGHT", () => {
  it("calcula weightGrams * precioPorGramo + laborCost (ORO_18K)", () => {
    // 5.5g * 95000 = 522500 + 15000 labor = 537500 (ya múltiplo de 100)
    const price = getProductPrice(
      {
        pricingMode: "BY_WEIGHT",
        material: "ORO_18K",
        weightGrams: 5.5,
        laborCost: 15000,
      },
      goldPrices
    );
    expect(price.toNumber()).toBe(537500);
  });

  it("calcula con ORO_BAJO usando su propio precio por gramo", () => {
    // 3g * 38000 = 114000, sin laborCost
    const price = getProductPrice(
      { pricingMode: "BY_WEIGHT", material: "ORO_BAJO", weightGrams: 3 },
      goldPrices
    );
    expect(price.toNumber()).toBe(114000);
  });

  it("trata laborCost ausente como 0", () => {
    const conLabor = getProductPrice(
      {
        pricingMode: "BY_WEIGHT",
        material: "ORO_18K",
        weightGrams: 2,
        laborCost: 0,
      },
      goldPrices
    );
    const sinLabor = getProductPrice(
      { pricingMode: "BY_WEIGHT", material: "ORO_18K", weightGrams: 2 },
      goldPrices
    );
    expect(conLabor.toNumber()).toBe(sinLabor.toNumber());
  });

  it("redondea el resultado final a la centena hacia arriba", () => {
    // 2.33g * 95000 = 221350 → redondea a 221400
    const price = getProductPrice(
      { pricingMode: "BY_WEIGHT", material: "ORO_18K", weightGrams: 2.33 },
      goldPrices
    );
    expect(price.toNumber()).toBe(221400);
  });

  it("lanza PricingError si falta weightGrams", () => {
    expect(() =>
      getProductPrice({ pricingMode: "BY_WEIGHT", material: "ORO_18K" }, goldPrices)
    ).toThrow(PricingError);
  });

  it("lanza PricingError si el material no tiene precio por gramo (ej. PLATA_925)", () => {
    expect(() =>
      getProductPrice(
        { pricingMode: "BY_WEIGHT", material: "PLATA_925", weightGrams: 4 },
        goldPrices
      )
    ).toThrow(PricingError);
  });

  it("reacciona a un cambio en el precio del gramo (el caso de uso central)", () => {
    const antes = getProductPrice(
      { pricingMode: "BY_WEIGHT", material: "ORO_18K", weightGrams: 5 },
      goldPrices
    );
    const nuevoGoldPrices: GoldPrices = {
      ...goldPrices,
      goldPricePerGram18k: new Prisma.Decimal(100000),
    };
    const despues = getProductPrice(
      { pricingMode: "BY_WEIGHT", material: "ORO_18K", weightGrams: 5 },
      nuevoGoldPrices
    );
    expect(despues.toNumber()).toBeGreaterThan(antes.toNumber());
    expect(despues.toNumber()).toBe(500000);
  });
});
