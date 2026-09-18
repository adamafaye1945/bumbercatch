import { Mic } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function VoiceAssistPopup({
  open,
  onOpenChange,
  label,
  resultText,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label?: string;
  resultText?: string | null;
}) {
  const resultLines = resultText ? resultText.split("\n").filter(Boolean) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="border-none bg-transparent p-0 shadow-none">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="relative flex size-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-success/30" />
            <div className="relative flex size-14 items-center justify-center rounded-full bg-success">
              <Mic className="size-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-foreground">{label ?? "Listening…"}</DialogTitle>
          {resultLines.length > 0 && (
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              {resultLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
