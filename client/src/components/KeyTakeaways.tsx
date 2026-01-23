import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, MapPin, ArrowRight, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

type KeyTakeawaysProps = {
  title: string;
  takeaways: string[];
  pipelineLocation: string;
  nextAction: string;
  compact?: boolean;
};

export function KeyTakeaways({ 
  title, 
  takeaways, 
  pipelineLocation, 
  nextAction,
  compact = false 
}: KeyTakeawaysProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-md bg-primary/5 border border-primary/20 hover-elevate">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span className="font-medium text-[10px] sm:text-xs">Key Takeaways</span>
            </div>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 p-2.5 sm:p-3 rounded-md bg-muted/30 border space-y-2">
            <ul className="space-y-1">
              {takeaways.slice(0, 3).map((t, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[9px] sm:text-xs text-muted-foreground">
                  <span className="w-1 h-1 mt-1.5 bg-primary rounded-full flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-1 text-[9px] sm:text-xs text-muted-foreground">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>{pipelineLocation}</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Card className="p-3 sm:p-4 sticky top-20">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h3 className="font-semibold text-xs sm:text-sm">Key Takeaways</h3>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <Badge variant="secondary" className="text-[9px] sm:text-xs mb-2">{title}</Badge>
          <ul className="space-y-1.5 sm:space-y-2">
            {takeaways.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-[10px] sm:text-xs text-muted-foreground">
                <span className="w-1 h-1 mt-1.5 bg-primary rounded-full flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-3 border-t space-y-2 sm:space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Pipeline Location</div>
              <div className="text-[10px] sm:text-xs font-medium">{pipelineLocation}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Next Action</div>
              <div className="text-[10px] sm:text-xs font-medium text-primary">{nextAction}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
