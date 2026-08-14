"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-silver hover:bg-ink-border hover:text-bone"
    >
      <LogOut className="size-4" />
      Cerrar sesión
    </Button>
  );
}
