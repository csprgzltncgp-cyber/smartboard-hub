import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TodoMenu from "@/components/todo/TodoMenu";
import TaskSection from "@/components/todo/TaskSection";

// Mock data for demonstration
const overdueTasks = [
  { id: 1844, date: "2024-03-29", author: "Janky Péter", title: "Több országgal rendelkező ügyfele...", overdueDays: 663 },
  { id: 2676, date: "2025-04-01", author: "Tompa Anita", title: "Data menüpont nem mutat márc...", overdueDays: 295 },
  { id: 2689, date: "2025-04-14", author: "Tompa Anita", title: "Pépco esetszámok és tanácsadás...", overdueDays: 282 },
  { id: 2749, date: "2025-05-22", author: "Tompa Anita", title: "Google on-site booking system", overdueDays: 244 },
  { id: 2796, date: "2025-07-31", author: "Tompa Anita", title: "On-site tanácsadások megjelení...", overdueDays: 174 },
  { id: 2791, date: "2025-08-29", author: "Kiss Barbara", title: "Best practices prezentáció", overdueDays: 145 },
  { id: 3026, date: "2025-10-10", author: "Szabó Mária", title: "EAP időpontfoglalás beállítás mó...", overdueDays: 103 },
  { id: 3059, date: "2025-11-28", author: "Tompa Anita", title: "live webinar platform létrehozása", overdueDays: 54 },
];

const todayTasks = [
  { id: 3188, date: "2026-01-21", author: "Kiss Barbara", title: "Tesconak értesítések", isNew: true, isLastDay: true },
];

const thisWeekTasks = [
  { id: 3177, date: "2026-01-30", author: "Jánosik Klaudia", title: "EAP online foglalások törlése" },
];

const completedTasks = [
  { id: 118, date: "2022-06-23", author: "Tompa Anita", title: "nuli feladat" },
  { id: 50, date: "2022-08-26", author: "Janky Péter", title: "LEGO aktivitások - 1. Probléma meg..." },
  { id: 51, date: "2022-08-26", author: "Janky Péter", title: "LEGO aktivitások - 2. Számítható Rá..." },
  { id: 52, date: "2022-08-26", author: "Janky Péter", title: "LEGO aktivitások - 3. Pénzügyes Prof..." },
  { id: 154, date: "2022-08-31", author: "Kiss Barbara", title: "Éjszek törlése" },
  { id: 163, date: "2022-09-02", author: "Tompa Anita", title: "Affiliate search workflow todo" },
  { id: 199, date: "2022-09-07", author: "Tompa Anita", title: "Ping software beüzemelése" },
  { id: 164, date: "2022-08-01", author: "Janky Péter", title: "Pénzüktze Professzor Prezentáció" },
  { id: 238, date: "2022-08-06", author: "Content", title: "" },
  { id: 243, date: "2022-09-06", author: "", title: "adf e-mail vázlat" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-3xl font-calibri-bold mb-2">TODO</h1>
      
      {/* Create New Link - Simple underlined blue link */}
      <a 
        href="#" 
        className="text-primary hover:underline mb-6 block"
        onClick={(e) => {
          e.preventDefault();
          navigate("/dashboard/todo/create");
        }}
      >
        Új feladat létrehozása
      </a>

      {/* TODO Menu */}
      <TodoMenu />

      {/* Task Sections */}
      <TaskSection 
        title="HATÁRIDŐN TÚL"
        count={overdueTasks.length}
        tasks={overdueTasks}
        variant="overdue"
        hasMorePages={false}
      />

      <TaskSection 
        title="MAI NAPON"
        count={todayTasks.length}
        tasks={todayTasks}
        variant="today"
        hasMorePages={false}
      />

      <TaskSection 
        title="KÖVETKEZŐ HETEKBEN"
        count={thisWeekTasks.length}
        tasks={thisWeekTasks}
        variant="week"
        hasMorePages={false}
      />

      <TaskSection 
        title="BEFEJEZVE"
        count={398}
        tasks={completedTasks}
        variant="completed"
        hasMorePages={true}
        onLoadMore={() => console.log("Load more")}
        onLoadAll={() => console.log("Load all")}
      />
    </div>
  );
};

export default Dashboard;
