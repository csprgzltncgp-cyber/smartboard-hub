import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
}

const CrmProgressBar = ({ progress, className }: ProgressBarProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-lg font-calibri-bold text-foreground min-w-[48px] text-right">
        {progress}%
      </span>
    </div>
  );
};

export default CrmProgressBar;
