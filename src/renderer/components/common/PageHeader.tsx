import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { LucideProps } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: ComponentType<LucideProps>;
}) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Back"
        onClick={() => navigate(-1)}
        className="-ml-2"
      >
        <ArrowLeft className="size-5" />
      </Button>
      {Icon && <Icon className="size-5 text-muted-foreground" />}
      <h1 className="text-xl font-semibold">{title}</h1>
    </div>
  );
}
