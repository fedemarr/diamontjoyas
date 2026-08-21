export type Material = "ORO_18K" | "ORO_BAJO" | "ENCHAPADO" | "PLATA_925";
export type PricingMode = "FIXED" | "BY_WEIGHT";

export type OrderStatus = "NUEVO" | "CONFIRMADO" | "PREPARANDO" | "ENVIADO" | "ENTREGADO" | "CANCELADO";
export type PaymentStatus = "PENDING" | "APPROVED" | "IN_PROCESS" | "REJECTED" | "REFUNDED" | "CANCELLED";
export type PaymentMethod = "MERCADO_PAGO" | "TRANSFERENCIA" | "EFECTIVO";
export type ShippingMethod = "ENVIO_DOMICILIO" | "SUCURSAL_CORREO" | "RETIRO_LOCAL";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  parentId: string | null;
  _count?: { products: number };
}

export interface AdminProductImage {
  /** Ausente hasta que se guarda — las imágenes recién subidas no tienen id todavía. */
  id?: string;
  url: string;
  alt: string;
  order: number;
  isPrimary: boolean;
}

export interface AdminProductVariant {
  id?: string;
  name: string;
  sku: string;
  priceDelta: number | null;
  weightGrams?: number | null;
  stock: number;
  isActive: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  categoryId: string;
  category?: { name: string; slug: string };
  material: Material;
  pricingMode: PricingMode;
  price: number | null;
  weightGrams: number | null;
  laborCost: number | null;
  compareAtPrice: number | null;
  cost: number | null;
  stock: number;
  lowStockAlert: number;
  trackStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  metaTitle: string | null;
  metaDescription: string | null;
  images: AdminProductImage[];
  variants: AdminProductVariant[];
  currentPrice?: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: { variants: number };
}

export interface ProductListResponse {
  products: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GoldPriceState {
  goldPricePerGram18k: number;
  goldPricePerGramLow: number;
  affectedCount18k: number;
  affectedCountLow: number;
}

export interface GoldPricePreviewItem {
  id: string;
  name: string;
  sku: string;
  material: Material;
  oldPrice: number;
  newPrice: number;
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: { row: number; sku?: string; message: string }[];
}

// ── Pedidos ────────────────────────────────────────────────────────────

export interface AdminOrderItem {
  id: string;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  unitCost: number | null;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  publicCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDni: string | null;
  shippingMethod: ShippingMethod;
  shippingAddress: {
    street?: string;
    number?: string;
    floor?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    notes?: string;
  } | null;
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  mpPaymentId: string | null;
  mpPreferenceId: string | null;
  trackingCode: string | null;
  internalNotes: string | null;
  customerNotes: string | null;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
  itemCount?: number;
}

export interface OrderListResponse {
  orders: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Finanzas ───────────────────────────────────────────────────────────

export interface FinanceSeriesPoint {
  label: string;
  value: number;
}

export interface FinanceBreakdown {
  name: string;
  value: number;
  count: number;
}

export interface FinanceSummary {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  revenue: number;
  orderCount: number;
  approvedCount: number;
  averageTicket: number;
  grossMargin: number;
  grossMarginPercent: number;
  series: FinanceSeriesPoint[];
  byCategory: FinanceBreakdown[];
  byMaterial: FinanceBreakdown[];
  topProducts: { name: string; sku: string; quantity: number; revenue: number }[];
  previous: {
    revenue: number;
    orderCount: number;
    approvedCount: number;
    averageTicket: number;
    grossMargin: number;
  };
}

// ── Cupones ────────────────────────────────────────────────────────────

export interface AdminCoupon {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface CouponListResponse {
  coupons: AdminCoupon[];
  total: number;
}

// ── Banners y anuncios ─────────────────────────────────────────────────

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface AdminAnnouncement {
  id: string;
  text: string;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
}

// ── Mensajes de contacto ───────────────────────────────────────────────

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactMessageListResponse {
  messages: AdminContactMessage[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  unread: number;
}

// ── Settings ───────────────────────────────────────────────────────────

export interface SettingsState {
  storeName: string;
  logoUrl: string | null;
  maintenanceMode: boolean;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  whatsappOrderTemplate: string;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  businessHours: string | null;
  instagram: string | null;
  facebook: string | null;
  shippingRates: { amba: number; interior: number; retiroLocal: number };
  freeShippingThreshold: number | null;
  transferDiscountPercent: number;
  installmentsEnabled: boolean;
  installmentsCount: number;
  bankAlias: string | null;
  bankCbu: string | null;
  bankHolderName: string | null;
  silverPricePerGram: number;
  platedPricePerGram: number;
  customChainGramsPerCm: number;
  customChainLaborCost: number;
}

// ── Dashboard ──────────────────────────────────────────────────────────

export interface DashboardSummary {
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  monthRevenue: number;
  averageTicket: number;
  pendingOrders: number;
  lowStock: { id: string; name: string; sku: string; stock: number; lowStockAlert: number }[];
  recentOrders: AdminOrder[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
  monthSeries: FinanceSeriesPoint[];
}
