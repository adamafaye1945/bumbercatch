import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import type { LucideProps } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  caption,
  to,
  onClick,
  selected = false,
  icon: Icon,
  size = "default",
}: {
  label: string;
  value: string | number;
  caption?: string;
  to?: string;
  onClick?: () => void;
  selected?: boolean;
  icon?: ComponentType<LucideProps>;
  size?: "default" | "hero";
}) {
  const content = (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </span>
      <span className={cn("font-semibold tabular-nums", size === "hero" ? "text-4xl" : "text-lg")}>
        {value}
      </span>
      {caption && <span className="text-xs text-muted-foreground">{caption}</span>}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="-m-2 rounded-md p-2 transition-colors hover:bg-accent/50">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "-m-2 rounded-md p-2 text-left transition-colors hover:bg-accent/50",
          selected && "bg-accent"
        )}
      >
        {content}
      </button>
    );
  }

  return content;
}
