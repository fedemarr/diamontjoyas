import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  sku: string;
  image: string | null;
  /** Snapshot al agregar — solo para mostrar en el carrito. El precio real
   *  se recalcula siempre en el servidor al confirmar el checkout. */
  unitPrice: number;
  quantity: number;
  /** null = no controla stock. */
  maxStock: number | null;
  variantName: string | null;
}

export interface AppliedCoupon {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
}

interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
}

function sameLine(a: CartItem, productId: string, variantId: string | null) {
  return a.productId === productId && a.variantId === variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.productId, item.variantId));
          if (existing) {
            const nextQuantity = item.maxStock
              ? Math.min(existing.quantity + item.quantity, item.maxStock)
              : existing.quantity + item.quantity;
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.variantId) ? { ...i, quantity: nextQuantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variantId)),
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => !sameLine(i, productId, variantId))
              : state.items.map((i) =>
                  sameLine(i, productId, variantId)
                    ? { ...i, quantity: i.maxStock ? Math.min(quantity, i.maxStock) : quantity }
                    : i
                ),
        })),

      clearCart: () => set({ items: [], coupon: null }),
      setCoupon: (coupon) => set({ coupon }),
    }),
    { name: "diamondva-cart" }
  )
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function couponDiscount(coupon: AppliedCoupon | null, subtotal: number): number {
  if (!coupon) return 0;
  const raw = coupon.type === "PERCENT" ? (subtotal * coupon.value) / 100 : coupon.value;
  return Math.min(raw, subtotal);
}
