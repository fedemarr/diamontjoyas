import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { AdminTopbar } from "@/components/layouts/admin-topbar";
import { QueryProvider } from "@/components/providers/query-provider";
import { auth } from "@/lib/auth";

/**
 * El middleware ya protege /admin/*, pero el layout vuelve a chequear la
 * sesión server-side (defensa en profundidad) y la necesita de todos
 * modos para mostrar nombre/rol en el topbar.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();
  if (session?.user?.kind !== "admin") {
    redirect("/login");
  }

  return (
    <QueryProvider>
      <div className="flex h-screen bg-ink text-bone print:block print:h-auto print:overflow-visible">
        <div className="hidden lg:block print:hidden">
          <AdminSidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible">
          <div className="print:hidden">
            <AdminTopbar user={session.user} />
          </div>
          <main className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}
