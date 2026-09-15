import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideProps } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ListRowProps {
  title: ReactNode;
  titleRight?: ReactNode;
  subtitle?: ReactNode;
  caption?: ReactNode;
  icon?: ComponentType<LucideProps>;
  trailingAction?: { label: string; onClick: () => void };
  to?: string;
}

export function ListRow({
  title,
  titleRight,
  subtitle,
  caption,
  icon: Icon,
  trailingAction,
  to,
}: ListRowProps) {
  const body = (
    <div className="flex flex-col gap-0.5 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-medium">
          {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
          {title}
        </span>
        {titleRight && (
          <span className="shrink-0 text-sm text-muted-foreground">{titleRight}</span>
        )}
        {trailingAction && (
          <button
            type="button"
            onClick={trailingAction.onClick}
            className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {trailingAction.label}
          </button>
        )}
      </div>
      {subtitle && <span className="text-sm">{subtitle}</span>}
      {caption && <span className="text-sm text-muted-foreground">{caption}</span>}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className={cn("block transition-colors hover:bg-accent/50 -mx-2 px-2 rounded-md")}>
        {body}
      </Link>
    );
  }

  return body;
}
