import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function EmptyState({
  icon, title, description, action, className,
}: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center", className)}>
      {icon && <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">{icon}</div>}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
