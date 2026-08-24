"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="border-ink-border bg-transparent text-bone hover:bg-ink-soft"
    >
      <LogOut className="size-4" />
      Cerrar sesión
    </Button>
  );
}
