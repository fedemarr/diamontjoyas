"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-bone hover:bg-ink-soft hover:text-gold lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-0 border-ink-border bg-ink p-0 text-bone">
        <AdminSidebar className="h-full w-full border-r-0" onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}