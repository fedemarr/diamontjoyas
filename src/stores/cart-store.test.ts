import { describe, expect, it } from "vitest";

import { cartItemCount, cartSubtotal, couponDiscount, type CartItem } from "@/stores/cart-store";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "p1",
    variantId: null,
    name: "Cadena Fígaro",
    slug: "cadena-figaro",
    sku: "DVA-CAD-001",
    image: null,
    unitPrice: 10000,
    quantity: 2,
    maxStock: 5,
    variantName: null,
    ...overrides,
  };
}

describe("cartSubtotal", () => {
  it("suma precio × cantidad de todas las líneas", () => {
    const items = [makeItem({ unitPrice: 10000, quantity: 2 }), makeItem({ unitPrice: 5000, quantity: 1 })];
    expect(cartSubtotal(items)).toBe(25000);
  });

  it("da 0 con el carrito vacío", () => {
    expect(cartSubtotal([])).toBe(0);
  });
});

describe("cartItemCount", () => {
  it("suma las cantidades, no la cantidad de líneas", () => {
    const items = [makeItem({ quantity: 3 }), makeItem({ quantity: 2 })];
    expect(cartItemCount(items)).toBe(5);
  });
});

describe("couponDiscount", () => {
  it("sin cupón, no hay descuento", () => {
    expect(couponDiscount(null, 10000)).toBe(0);
  });

  it("PERCENT calcula el porcentaje sobre el subtotal", () => {
    expect(couponDiscount({ code: "X", type: "PERCENT", value: 10 }, 10000)).toBe(1000);
  });

  it("FIXED descuenta el valor fijo", () => {
    expect(couponDiscount({ code: "X", type: "FIXED", value: 1500 }, 10000)).toBe(1500);
  });

  it("nunca deja el total negativo — el descuento se topea al subtotal", () => {
    expect(couponDiscount({ code: "X", type: "FIXED", value: 99999 }, 10000)).toBe(10000);
  });
});
