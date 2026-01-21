import { MousePointer2, AlertTriangle, Clock } from "lucide-react";

interface TaskCardProps {
  id: number;
  date: string;
  author: string;
  title: string;
  overdueDays?: number;
  isNew?: boolean;
  isLastDay?: boolean;
  isCompleted?: boolean;
}

const TaskCard = ({ 
  id, 
  date, 
  author, 
  title, 
  overdueDays, 
  isNew,
  isLastDay,
  isCompleted 
}: TaskCardProps) => {
  const getBackgroundStyle = () => {
    if (isCompleted) {
      return "bg-cgp-task-completed-purple text-white";
    }
    return "bg-white/70";
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl p-4 mb-3 ${getBackgroundStyle()}`}>
      {/* Task Info */}
      <p className={`flex-1 min-w-[200px] ${isCompleted ? 'text-white' : 'text-foreground'}`}>
        <span className="font-calibri-bold">#{`TD${id}`}</span>
        <span className="mx-1">-</span>
        <span>{date}</span>
        <span className="mx-1">-</span>
        <span>{author}</span>
        <span className="mx-1">-</span>
        <span className="truncate">{title}</span>
      </p>

      {/* Select Button */}
      <button className={`${isCompleted ? 'bg-cgp-teal-light/50' : 'bg-cgp-teal-light'} text-white px-4 py-2 rounded-xl flex items-center gap-2 font-calibri-bold hover:bg-primary transition-colors`}>
        <MousePointer2 className="w-5 h-5" />
        KIVÁLASZT
      </button>

      {/* Status Badges */}
      {/* Status Badges - NO radius, always with icon */}
      {isNew && (
        <span className="bg-cgp-teal-light text-white px-3 py-2 flex items-center gap-1 text-sm font-calibri-bold">
          <AlertTriangle className="w-4 h-4" />
          Új
        </span>
      )}

      {isLastDay && (
        <span className="bg-cgp-task-badge-overdue text-white px-3 py-2 flex items-center gap-1 text-sm font-calibri-bold">
          <Clock className="w-4 h-4" />
          Utolsó nap
        </span>
      )}

      {/* Overdue Badge - NO radius, with icon */}
      {overdueDays && overdueDays > 0 && (
        <span className="bg-cgp-task-badge-overdue text-white px-3 py-2 flex items-center gap-1 text-sm font-calibri-bold">
          <AlertTriangle className="w-4 h-4" />
          Határidőn túl : {overdueDays} nap!
        </span>
      )}
    </div>
  );
};

export default TaskCard;
