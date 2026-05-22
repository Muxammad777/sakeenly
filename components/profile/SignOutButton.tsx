"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-bg px-4 text-sm text-fg transition-colors hover:bg-bg-elevated"
    >
      <LogOut className="h-4 w-4" />
      Выйти
    </button>
  );
}
