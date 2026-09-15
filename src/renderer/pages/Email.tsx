import { Mail } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { ListRow } from "@/components/common/ListRow";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { emails, type EmailAccount } from "@/data/emails";

const accounts: Array<{ value: "all" | EmailAccount; label: string }> = [
  { value: "all", label: "All" },
  { value: "Personal", label: "Personal" },
  { value: "Work", label: "Work" },
];

export function Email() {
  return (
    <div>
      <PageHeader title="Email" icon={Mail} />

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          {accounts.map((account) => {
            const unreadCount = emails.filter(
              (item) => (account.value === "all" || item.account === account.value) && item.unread
            ).length;
            return (
              <TabsTrigger key={account.value} value={account.value}>
                {account.label}
                {unreadCount > 0 && <Badge variant="outline">{unreadCount}</Badge>}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {accounts.map((account) => (
          <TabsContent key={account.value} value={account.value}>
            <div className="divide-y divide-border">
              {emails
                .filter((item) => account.value === "all" || item.account === account.value)
                .map((item) => (
                  <ListRow
                    key={item.id}
                    to={`/email/${item.id}`}
                    title={item.sender}
                    titleRight={
                      item.unread ? <span className="block size-1.5 rounded-full bg-primary" /> : undefined
                    }
                    subtitle={item.subject}
                    caption={item.preview}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
