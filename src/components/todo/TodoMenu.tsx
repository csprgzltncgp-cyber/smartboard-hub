import { ClipboardList, ClipboardCopy, Calendar, List, BarChart3, Filter } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const TodoMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { label: "Beérkezett feladatok", icon: ClipboardList, path: "/dashboard" },
    { label: "Kiadott feladatok", icon: ClipboardCopy, path: "/dashboard/todo/issued" },
    { label: "Naptár", icon: Calendar, path: "/dashboard/calendar" },
    { label: "", icon: List, path: "/dashboard/todo/all", iconOnly: true },
    { label: "", icon: BarChart3, path: "/dashboard/todo/statistics", iconOnly: true },
  ];

  return (
    <div className="mb-8">
      {/* Menu Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-calibri-bold transition-colors ${
                isActive(item.path) 
                  ? "bg-primary text-white" 
                  : "bg-cgp-teal-light text-white hover:bg-primary"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!item.iconOnly && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Filter Button - Right Side */}
        <button
          onClick={() => navigate("/dashboard/todo/filter")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-calibri-bold transition-colors ${
            isActive("/dashboard/todo/filter")
              ? "bg-primary text-white"
              : "bg-cgp-teal-light text-white hover:bg-primary"
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Szűrés</span>
        </button>
      </div>
    </div>
  );
};

export default TodoMenu;
