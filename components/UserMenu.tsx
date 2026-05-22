"use client";

import { Link } from "@/i18n/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-20 animate-pulse rounded-full bg-bg-elevated" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn()}
        className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        Войти
      </button>
    );
  }

  const initial = (session.user.name ?? session.user.email ?? "S").charAt(0).toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="grid h-9 w-9 place-items-center rounded-full bg-bg-elevated text-sm font-medium text-fg transition-colors hover:ring-2 hover:ring-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {initial}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border bg-bg-elevated p-1 shadow-lg"
        >
          <div className="px-3 py-2 text-xs text-fg-muted">
            {session.user.email ?? session.user.name}
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg outline-none transition-colors data-[highlighted]:bg-bg"
            >
              <UserIcon className="h-4 w-4" />
              Профиль
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => signOut()}
            className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg outline-none transition-colors data-[highlighted]:bg-bg"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
