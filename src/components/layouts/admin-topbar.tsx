import { Search } from "lucide-react";

import { AdminMobileNav } from "@/components/layouts/admin-mobile-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  STAFF: "Staff",
};

export function AdminTopbar({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: string };
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-ink-border bg-ink px-4 md:px-6">
      <AdminMobileNav />
      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-silver" />
        {/* TODO(Fase 4+): buscador global de productos/pedidos/clientes */}
        <Input
          type="search"
          placeholder="Buscar en el panel..."
          className="border-ink-border bg-ink-soft pl-9 text-bone placeholder:text-silver/70 focus-visible:border-gold focus-visible:ring-gold/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-bone">{user.name ?? "Sin nombre"}</p>
          <p className="text-xs text-silver">{user.email ?? ""}</p>
        </div>
        <Badge variant="outline" className="border-gold/40 text-gold-light">
          {ROLE_LABEL[user.role] ?? user.role}
        </Badge>
        <LogoutButton />
      </div>
    </header>
  );
}
