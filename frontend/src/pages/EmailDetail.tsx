import { useParams } from "react-router-dom";
import { Mail } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/common/LoadingState";
import { DataUnavailable } from "@/components/common/DataUnavailable";
import { useEmail } from "@/hooks/queries";

export function EmailDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: email, isLoading, isError } = useEmail(id);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Email" icon={Mail} />
        <LoadingState />
      </div>
    );
  }

  if (isError || !email) {
    return (
      <div>
        <PageHeader title="Email" icon={Mail} />
        <DataUnavailable message="This email couldn't be found." />
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
