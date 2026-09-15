export function StatusPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  const dot = (
    <span className={"size-1.5 rounded-full " + (active ? "bg-success" : "bg-muted-foreground")} />
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {dot}
        {label}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      {dot}
      {label}
    </div>
  );
}
