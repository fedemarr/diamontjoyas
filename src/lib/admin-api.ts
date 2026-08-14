import type {
  AdminAnnouncement,
  AdminBanner,
  AdminCategory,
  AdminContactMessage,
  AdminCoupon,
  AdminOrder,
  AdminProduct,
  ContactMessageListResponse,
  CouponListResponse,
  DashboardSummary,
  FinanceSummary,
  GoldPricePreviewItem,
  GoldPriceState,
  ImportResult,
  OrderListResponse,
  ProductListResponse,
  SettingsState,
} from "@/types/admin";
import type { BannerInput } from "@/lib/validations/banner";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error ?? `Error ${res.status}`);
  }
  return json as T;
}

// ── Categorías ─────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () => apiFetch<{ categories: AdminCategory[] }>("/api/admin/categories"),
  create: (data: Partial<AdminCategory>) =>
    apiFetch<{ category: AdminCategory }>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<AdminCategory>) =>
    apiFetch<{ category: AdminCategory }>(`/api/admin/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    apiFetch<{ category: AdminCategory }>(`/api/admin/categories/${id}`, { method: "DELETE" }),
  reorder: (ids: string[]) =>
    apiFetch<{ ok: true }>("/api/admin/categories/reorder", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};

// ── Productos ──────────────────────────────────────────────────────────

export const productsApi = {
  list: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") qs.set(key, String(value));
    }
    return apiFetch<ProductListResponse>(`/api/admin/products?${qs.toString()}`);
  },
  get: (id: string) => apiFetch<{ product: AdminProduct }>(`/api/admin/products/${id}`),
  create: (data: unknown) =>
    apiFetch<{ product: AdminProduct }>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: unknown) =>
    apiFetch<{ product: AdminProduct }>(`/api/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) => apiFetch<{ ok: true }>(`/api/admin/products/${id}`, { method: "DELETE" }),
  duplicate: (id: string) =>
    apiFetch<{ product: AdminProduct }>(`/api/admin/products/${id}/duplicate`, { method: "POST" }),
  bulk: (ids: string[], action: "activate" | "deactivate" | "delete") =>
    apiFetch<{ ok: true; count: number }>("/api/admin/products/bulk", {
      method: "POST",
      body: JSON.stringify({ ids, action }),
    }),
  importCsv: (csv: string) =>
    apiFetch<ImportResult>("/api/admin/products/import", {
      method: "POST",
      body: JSON.stringify({ csv }),
    }),
};

// ── Pedidos ────────────────────────────────────────────────────────────

export const ordersApi = {
  list: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") qs.set(key, String(value));
    }
    return apiFetch<OrderListResponse>(`/api/admin/orders?${qs.toString()}`);
  },
  get: (id: string) => apiFetch<{ order: AdminOrder }>(`/api/admin/orders/${id}`),
  update: (id: string, data: unknown) =>
    apiFetch<{ order: AdminOrder }>(`/api/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ── Finanzas ───────────────────────────────────────────────────────────

export const finanzasApi = {
  summary: (from: string, to: string) =>
    apiFetch<FinanceSummary>(`/api/admin/finanzas?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
};

// ── Cupones ────────────────────────────────────────────────────────────

export const couponsApi = {
  list: () => apiFetch<CouponListResponse>("/api/admin/coupons"),
  create: (data: unknown) =>
    apiFetch<{ coupon: AdminCoupon }>("/api/admin/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: unknown) =>
    apiFetch<{ coupon: AdminCoupon }>(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) => apiFetch<{ ok: true }>(`/api/admin/coupons/${id}`, { method: "DELETE" }),
};

// ── Banners y anuncios ─────────────────────────────────────────────────

export const bannersApi = {
  list: () => apiFetch<{ banners: AdminBanner[] }>("/api/admin/banners"),
  create: (data: BannerInput) =>
    apiFetch<{ banner: AdminBanner }>("/api/admin/banners", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: BannerInput) =>
    apiFetch<{ banner: AdminBanner }>(`/api/admin/banners/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) => apiFetch<{ ok: true }>(`/api/admin/banners/${id}`, { method: "DELETE" }),
};

export const announcementsApi = {
  list: () => apiFetch<{ announcements: AdminAnnouncement[] }>("/api/admin/announcements"),
  create: (data: unknown) =>
    apiFetch<{ announcement: AdminAnnouncement }>("/api/admin/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: unknown) =>
    apiFetch<{ announcement: AdminAnnouncement }>(`/api/admin/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    apiFetch<{ ok: true }>(`/api/admin/announcements/${id}`, { method: "DELETE" }),
};

// ── Settings ───────────────────────────────────────────────────────────

export const settingsApi = {
  get: () => apiFetch<{ settings: SettingsState }>("/api/admin/settings"),
  update: (data: unknown) =>
    apiFetch<{ settings: SettingsState }>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ── Mensajes de contacto ───────────────────────────────────────────────

export const contactMessagesApi = {
  list: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") qs.set(key, String(value));
    }
    return apiFetch<ContactMessageListResponse>(`/api/admin/contact-messages?${qs.toString()}`);
  },
  setRead: (id: string, isRead: boolean) =>
    apiFetch<{ message: AdminContactMessage }>(`/api/admin/contact-messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isRead }),
    }),
  remove: (id: string) =>
    apiFetch<{ ok: true }>(`/api/admin/contact-messages/${id}`, { method: "DELETE" }),
};

// ── Dashboard ──────────────────────────────────────────────────────────

export const dashboardApi = {
  summary: () => apiFetch<DashboardSummary>("/api/admin/dashboard"),
};

// ── Precio del oro ─────────────────────────────────────────────────────
export const goldPriceApi = {
  current: () => apiFetch<GoldPriceState>("/api/admin/settings/gold-price"),
  preview: (data: { goldPricePerGram18k: number; goldPricePerGramLow: number }) =>
    apiFetch<{ items: GoldPricePreviewItem[]; affectedCount: number }>(
      "/api/admin/settings/gold-price/preview",
      { method: "POST", body: JSON.stringify(data) }
    ),
  apply: (data: { goldPricePerGram18k: number; goldPricePerGramLow: number }) =>
    apiFetch<{ ok: true }>("/api/admin/settings/gold-price", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  history: () =>
    apiFetch<{
      history: {
        id: string;
        createdAt: string;
        user: { name: string; email: string } | null;
        changes: { before: GoldPriceState; after: GoldPriceState };
      }[];
    }>("/api/admin/settings/gold-price/history"),
};

// ── Uploads ────────────────────────────────────────────────────────────

export interface SignedUploadParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export const uploadsApi = {
  sign: () => apiFetch<SignedUploadParams>("/api/admin/uploads/sign", { method: "POST" }),
};

export async function uploadImageToCloudinary(file: File): Promise<{ url: string }> {
  const params = await uploadsApi.sign();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", params.apiKey);
  formData.append("timestamp", String(params.timestamp));
  formData.append("signature", params.signature);
  formData.append("folder", params.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? "Error subiendo la imagen a Cloudinary");
  }

  return { url: json.secure_url as string };
}
