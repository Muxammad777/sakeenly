"use client";

import { useLocale } from "next-intl";
import { useTransition, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LANG_META: Record<Locale, { native: string; short: string }> = {
  ru: { native: "Русский", short: "РУС" },
  tg: { native: "Тоҷикӣ", short: "ТҶК" },
  uz: { native: "Oʻzbek", short: "UZB" },
  kk: { native: "Қазақ", short: "ҚАЗ" },
  ky: { native: "Кыргыз", short: "КЫР" },
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSelect = (next: Locale) => {
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={pending}
          aria-label="Язык / Language"
          className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 font-mono text-[11px] tracking-[0.08em] text-fg-muted transition-colors hover:border-border-strong hover:text-fg disabled:opacity-60"
        >
          <Globe className="h-3 w-3 text-accent" />
          <span>{LANG_META[locale].short}</span>
          <ChevronDown className="h-2.5 w-2.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border-strong bg-surface p-1.5 shadow-lg"
        >
          {routing.locales.map((lang) => (
            <DropdownMenu.Item
              key={lang}
              onSelect={() => onSelect(lang)}
              className={cn(
                "flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                "data-[highlighted]:bg-surface-2",
                lang === locale ? "bg-accent/14 text-accent" : "text-fg",
              )}
            >
              <span>{LANG_META[lang].native}</span>
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.08em]",
                  lang === locale ? "text-accent" : "text-fg-dim",
                )}
              >
                {LANG_META[lang].short}
              </span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
