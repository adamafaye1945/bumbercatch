import { Button } from "@/components/ui/button";

export function ActionBanner({
  message,
  actionLabel,
  onAction,
  onClick,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
  onClick?: () => void;
}) {
  return (
    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="text-left text-sm transition-colors hover:text-muted-foreground"
        >
          {message}
        </button>
      ) : (
        <span className="text-sm">{message}</span>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
