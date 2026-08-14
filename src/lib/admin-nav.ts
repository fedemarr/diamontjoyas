import type { LucideIcon } from "lucide-react";
import {
  Coins,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Fases futuras — la ruta todavía no existe, se linkea igual a propósito. */
  pending?: boolean;
}

/**
 * Nav completo del admin (sección 5 del prompt maestro). Se arma en la
 * Fase 3 (layout) aunque casi todas las rutas se construyen en fases
 * posteriores — mismo criterio que el header del storefront.
 */
export const adminNav: AdminNavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Productos", href: "/admin/productos", icon: Package },
  { name: "Categorías", href: "/admin/categorias", icon: FolderTree },
  { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { name: "Finanzas", href: "/admin/finanzas", icon: TrendingUp },
  { name: "Precio del oro", href: "/admin/precio-oro", icon: Coins },
  { name: "Cupones", href: "/admin/cupones", icon: Tag },
  { name: "Banners y anuncios", href: "/admin/banners", icon: ImageIcon },
  { name: "Mensajes", href: "/admin/mensajes", icon: MessageSquare },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings },
  { name: "Usuarios", href: "/admin/usuarios", icon: Users, pending: true },
];
