import { useParams } from "react-router-dom";
import { Mail } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { emails } from "@/data/emails";

export function EmailDetail() {
  const { id } = useParams<{ id: string }>();
  const email = emails.find((item) => item.id === id);

  if (!email) {
    return (
      <div>
        <PageHeader title="Email" icon={Mail} />
        <p className="text-sm text-muted-foreground">This email couldn't be found.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={email.account} icon={Mail} />

      <div className="mb-4 flex items-center justify-between">
        <span className="font-medium">{email.sender}</span>
        <Badge variant="outline">{email.account}</Badge>
      </div>

      <h1 className="mb-4 text-lg font-semibold">{email.subject}</h1>

      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{email.body}</p>
    </div>
  );
}
