import { Calendar, MousePointer2, AlertTriangle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Task {
  id: number;
  date: string;
  author: string;
  title: string;
  overdueDays?: number;
  isNew?: boolean;
  isLastDay?: boolean;
}

interface TodayTasksPanelProps {
  tasks: Task[];
  maxItems?: number;
}

const TodayTasksPanel = ({ tasks, maxItems = 5 }: TodayTasksPanelProps) => {
  const navigate = useNavigate();

  const displayedTasks = tasks.slice(0, maxItems);
  const hasMore = tasks.length > maxItems;

  return (
    <div id="today-tasks-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-task-today text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <Calendar className="w-6 h-6 md:w-8 md:h-8" />
          Mai feladatok: {tasks.length}
        </h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-cgp-link hover:text-cgp-link-hover hover:underline pb-2 text-sm"
        >
          Összes feladat →
        </button>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-task-today/20 p-6 md:p-8">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nincs mai feladat. 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {displayedTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("/dashboard")}
              >
                {/* Task Info */}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-calibri-bold text-foreground">
                    <span className="text-primary">#{`TD${task.id}`}</span>
                    <span className="mx-2">•</span>
                    <span>{task.title}</span>
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{task.date}</span>
                    <span className="mx-1">•</span>
                    <span>{task.author}</span>
                  </div>
                </div>

                {/* Select Button */}
                <button className="bg-cgp-teal-light text-white px-4 py-2 rounded-xl flex items-center gap-2 font-calibri-bold hover:bg-primary transition-colors">
                  <MousePointer2 className="w-4 h-4" />
                  KIVÁLASZT
                </button>

                {/* Status Badges */}
                {task.isNew && (
                  <span className="bg-cgp-badge-new text-white px-3 py-2 flex items-center gap-1 text-sm font-calibri-bold">
                    <AlertTriangle className="w-4 h-4" />
                    Új
                  </span>
                )}

                {task.isLastDay && (
                  <span className="bg-cgp-badge-lastday text-white px-3 py-2 flex items-center gap-1 text-sm font-calibri-bold">
                    <Clock className="w-4 h-4" />
                    Utolsó nap
                  </span>
                )}

                {task.overdueDays && task.overdueDays > 0 && (
                  <span className="bg-cgp-badge-overdue text-white px-3 py-2 flex items-center gap-1 text-sm font-calibri-bold">
                    <AlertTriangle className="w-4 h-4" />
                    {task.overdueDays} nap késés
                  </span>
                )}
              </div>
            ))}

            {/* Show more link */}
            {hasMore && (
              <div className="text-center pt-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-cgp-link hover:text-cgp-link-hover hover:underline text-sm font-calibri-bold"
                >
                  + {tasks.length - maxItems} további feladat
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayTasksPanel;
