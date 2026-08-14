"use client";

import { Diamond } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNav } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-ink-border bg-ink-soft",
        className
      )}
    >
      <Link href="/admin" className="flex items-center gap-2 px-5 py-6">
        <Diamond className="size-5 text-gold" strokeWidth={1.5} />
        <span className="font-display text-lg font-semibold tracking-wide text-bone">
          DIAMOND<span className="text-gradient-gold">VA.Co</span>
        </span>
      </Link>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {adminNav.map((item) => {
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-ink-border text-gold"
                  : "text-silver hover:bg-ink-border/60 hover:text-bone"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
