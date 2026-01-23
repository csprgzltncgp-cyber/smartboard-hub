import { ChevronDown, ChevronsDown } from "lucide-react";
import TaskCard from "./TaskCard";

interface Task {
  id: number;
  date: string;
  author: string;
  title: string;
  overdueDays?: number;
  isNew?: boolean;
  isLastDay?: boolean;
}

interface TaskSectionProps {
  title: string;
  count: number;
  tasks: Task[];
  variant: "overdue" | "today" | "week" | "upcoming" | "completed";
  hasMorePages?: boolean;
  onLoadMore?: () => void;
  onLoadAll?: () => void;
}

const variantStyles = {
  overdue: {
    bg: "bg-cgp-badge-overdue/20",
    headline: "bg-cgp-badge-overdue",
    textColor: "text-white",
  },
  today: {
    bg: "bg-cgp-task-today/20",
    headline: "bg-cgp-task-today",
    textColor: "text-white",
  },
  week: {
    bg: "bg-cgp-task-today/15",
    headline: "bg-cgp-task-today/60",
    textColor: "text-white",
  },
  upcoming: {
    bg: "bg-cgp-task-today/10",
    headline: "bg-cgp-task-today/40",
    textColor: "text-black",
  },
  completed: {
    bg: "bg-cgp-task-completed-purple/20",
    headline: "bg-cgp-task-completed-purple",
    textColor: "text-white",
  },
};

const TaskSection = ({ 
  title, 
  count, 
  tasks, 
  variant,
  hasMorePages = false,
  onLoadMore,
  onLoadAll
}: TaskSectionProps) => {
  const styles = variantStyles[variant];

  return (
    <div className="mb-8">
      {/* Headline Container */}
      <div className="flex items-end justify-between">
        <h2 className={`${styles.headline} ${styles.textColor} uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold`}>
          {title}: {count}
        </h2>
        <div className="text-cgp-teal-light text-sm flex items-center gap-1 pb-2">
          <span className="hidden sm:inline">↑↓ Rendezés:</span>
          <span>Határidő - Növekvő</span>
        </div>
      </div>

      {/* Tasks Container */}
      <div className={`${styles.bg} p-6 md:p-10 lg:p-14`}>
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            {...task}
            isCompleted={variant === "completed"}
          />
        ))}

        {/* Load More Buttons */}
        {hasMorePages && (
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={onLoadMore}
              className="bg-cgp-teal-light text-white px-5 py-3 rounded-xl flex items-center gap-2 font-calibri-bold hover:bg-primary transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
              MUTASS TÖBBET
            </button>
            <button 
              onClick={onLoadAll}
              className="bg-cgp-teal-light text-white px-5 py-3 rounded-xl flex items-center gap-2 font-calibri-bold hover:bg-primary transition-colors"
            >
              <ChevronsDown className="w-5 h-5" />
              MUTASD AZ ÖSSZESET
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSection;
