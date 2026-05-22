import { Check } from "lucide-react";
import { CheckoutButton } from "./CheckoutButton";
import { ManageBillingButton } from "./ManageBillingButton";
import { cn } from "@/lib/utils";

interface PricingTableProps {
  isAuthenticated: boolean;
  currentPlan: "free" | "premium" | "family";
  isStripeReady: boolean;
}

const FEATURES = {
  free: [
    "Полный Mushaf reader (KFGQPC)",
    "Все переводы и чтецы",
    "5 AI-вопросов в сутки",
    "Закладки и заметки",
  ],
  premium: [
    "Всё из Free",
    "Безлимитные AI-вопросы",
    "Расширенные темы (Mushaf-paper, sepia)",
    "Ссылки на тафсиры",
    "Приоритетные обновления",
  ],
  family: [
    "Всё из Premium",
    "До 6 участников семьи",
    "Детский режим (Iqra, первые суры)",
    "Parent dashboard",
    "Семейные закладки",
  ],
} as const;

export function PricingTable({ isAuthenticated, currentPlan, isStripeReady }: PricingTableProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Tier
        title="Free"
        price="$0"
        cadence="навсегда"
        features={FEATURES.free}
        active={currentPlan === "free"}
        cta={null}
      />

      <Tier
        title="Premium"
        price="$4.99"
        cadence="в месяц · $39.99/год"
        features={FEATURES.premium}
        active={currentPlan === "premium"}
        highlighted
        cta={
          currentPlan === "premium" ? (
            <ManageBillingButton />
          ) : (
            <div className="flex flex-col gap-2">
              <CheckoutButton
                planOptionId="premium-monthly"
                isAuthenticated={isAuthenticated}
                disabled={!isStripeReady}
                label="$4.99 / мес"
              />
              <CheckoutButton
                planOptionId="premium-yearly"
                isAuthenticated={isAuthenticated}
                disabled={!isStripeReady}
                variant="ghost"
                label="$39.99 / год · –33%"
              />
            </div>
          )
        }
      />

      <Tier
        title="Family"
        price="$9.99"
        cadence="в месяц · до 6 человек"
        features={FEATURES.family}
        active={currentPlan === "family"}
        cta={
          currentPlan === "family" ? (
            <ManageBillingButton />
          ) : (
            <CheckoutButton
              planOptionId="family-monthly"
              isAuthenticated={isAuthenticated}
              disabled={!isStripeReady}
              label="$9.99 / мес"
            />
          )
        }
      />
    </div>
  );
}

function Tier({
  title,
  price,
  cadence,
  features,
  active,
  highlighted,
  cta,
}: {
  title: string;
  price: string;
  cadence: string;
  features: readonly string[];
  active: boolean;
  highlighted?: boolean;
  cta: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border p-8",
        highlighted
          ? "border-accent/60 bg-accent/5 shadow-[0_0_0_1px_hsl(var(--accent)/0.2)]"
          : "border-border bg-bg-elevated/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-display text-2xl text-fg">{title}</h2>
        {active ? (
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            Активен
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-4xl text-fg">{price}</p>
      <p className="mt-1 text-xs text-fg-muted">{cadence}</p>

      <ul className="my-6 space-y-2 text-sm text-fg">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">{cta}</div>
    </div>
  );
}
