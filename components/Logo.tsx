import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 text-fg transition-opacity hover:opacity-80",
        className,
      )}
      aria-label="Sakeenly home"
    >
      <span aria-hidden className="grid h-[26px] w-[26px] place-items-center text-accent">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
        </svg>
      </span>
      <span className="font-display text-[19px] tracking-tight">Sakeenly</span>
    </Link>
  );
}
