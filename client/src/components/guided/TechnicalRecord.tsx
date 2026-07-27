import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type TechnicalRecordProps = {
  title?: string;
  data: unknown;
  defaultOpen?: boolean;
};

export function TechnicalRecord({
  title = "View Technical Record",
  data,
  defaultOpen = false,
}: TechnicalRecordProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
      <CollapsibleTrigger
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] px-3 py-2.5 text-left text-sm font-medium text-[color:var(--icdu-fg)] hover:bg-[color:var(--icdu-surface-hover)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--icdu-blue)]"
        data-testid="view-technical-record"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[color:var(--icdu-fg-faint)] transition-transform",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="icdu-code-panel mt-2 rounded-lg border border-[color:var(--icdu-border)] bg-[color:var(--icdu-bg)] p-3 font-mono text-[color:var(--icdu-fg-muted)]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}
