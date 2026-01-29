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
  variant?: "default" | "highlight";
}

export const CollapsiblePanel = ({
  title,
  defaultOpen = false,
  children,
  className,
  variant = "default",
}: CollapsiblePanelProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isHighlight = variant === "highlight";

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className={cn(
        "bg-card border rounded-lg overflow-hidden",
        isHighlight && "border-[#91b752] border-2",
        className
      )}
    >
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            "flex items-center justify-between p-4 cursor-pointer transition-colors",
            isOpen
              ? isHighlight 
                ? "bg-[#91b752] text-white"
                : "bg-primary text-primary-foreground"
              : isHighlight
                ? "bg-[#91b752]/20 hover:bg-[#91b752]/30"
                : "bg-muted hover:bg-muted/80"
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
