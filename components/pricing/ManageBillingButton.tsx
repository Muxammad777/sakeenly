"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ManageBillingButton() {
  const [pending, setPending] = useState(false);

  const handle = async () => {
    setPending(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) {
        alert(`Не удалось открыть billing portal: ${data?.error ?? res.status}`);
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
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-bg text-sm font-medium text-fg transition-colors hover:bg-bg-elevated disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Управлять подпиской
    </button>
  );
}
