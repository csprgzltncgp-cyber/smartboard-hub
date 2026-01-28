import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface CollapsiblePanelProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CollapsiblePanel = ({
  title,
  defaultOpen = false,
  children,
  className,
}: CollapsiblePanelProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn("bg-card border rounded-lg", className)}>
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            "flex items-center justify-between p-4 cursor-pointer transition-colors",
            isOpen
              ? "bg-primary text-primary-foreground rounded-t-lg"
              : "bg-muted hover:bg-muted/80 rounded-lg"
          )}
        >
          <span className="font-medium">{title}</span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-6 border-t">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};
