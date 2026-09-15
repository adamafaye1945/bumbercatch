import { Link } from "react-router-dom";

export function SectionHeader({
  title,
  meta,
  to,
}: {
  title: string;
  meta?: string;
  to?: string;
}) {
  const heading = (
    <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
      {title}
    </h2>
  );

  return (
    <div className="mb-3 flex items-baseline justify-between">
      {to ? (
        <Link to={to} className="transition-colors hover:text-foreground">
          {heading}
        </Link>
      ) : (
        heading
      )}
      {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
    </div>
  );
}
