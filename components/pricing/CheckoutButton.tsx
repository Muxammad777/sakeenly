"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  planOptionId: "premium-monthly" | "premium-yearly" | "family-monthly";
  isAuthenticated: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  label: string;
}

export function CheckoutButton({
  planOptionId,
  isAuthenticated,
  disabled,
  variant = "primary",
  label,
}: CheckoutButtonProps) {
  const [pending, setPending] = useState(false);

  const handle = async () => {
    if (!isAuthenticated) {
      window.location.href = `/signin?callbackUrl=${encodeURIComponent("/pricing")}`;
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planOptionId }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) {
        alert(`Не удалось открыть Checkout: ${data?.error ?? res.status}`);
        setPending(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={disabled || pending}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition-opacity disabled:opacity-60",
        variant === "primary"
          ? "bg-accent text-accent-fg hover:opacity-90"
          : "border border-border bg-bg text-fg hover:bg-bg-elevated",
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </button>
  );
}
