import { useI18n } from "@/i18n/i18n-context";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  const { t } = useI18n();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        aria-hidden
        className="grid place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          width={size * 0.6}
          height={size * 0.6}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 3 8v6c0 4.5 3.5 7.5 9 8 5.5-.5 9-3.5 9-8V8l-9-5Z" />
          <path d="m9 12 2.2 2.2L15 10.5" />
        </svg>
      </div>

      <div className="leading-tight">
        <div className="font-display text-lg font-bold tracking-tight">
          {t("brand.name")}
        </div>

        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {t("brand.agent")}
        </div>
      </div>
    </div>
  );
}