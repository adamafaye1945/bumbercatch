import { Bell } from "lucide-react";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ReminderPopup({
  open,
  onOpenChange,
  title,
  message,
  actionLabel,
  onAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent">
            <Bell className="size-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
          <div className="mt-3 flex w-full gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
              Dismiss
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onAction();
                onOpenChange(false);
              }}
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
