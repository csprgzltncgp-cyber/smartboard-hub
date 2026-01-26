import { Search, FileText, User, Calendar, AlertTriangle } from "lucide-react";
import { ExpertSearchDeadline } from "@/data/operativeMockData";
import { useNavigate } from "react-router-dom";

interface SearchDeadlinePanelProps {
  items: ExpertSearchDeadline[];
}

const SearchDeadlinePanel = ({ items }: SearchDeadlinePanelProps) => {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div id="search-deadline-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-badge-overdue text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <Search className="w-6 h-6 md:w-8 md:h-8" />
          Szakértő keresés határidőn túl: {items.length}
        </h2>
        <button
          onClick={() => navigate("/dashboard/all-cases")}
          className="text-cgp-link hover:text-cgp-link-hover hover:underline pb-2 text-sm"
        >
          Összes eset →
        </button>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-badge-overdue/20 p-6 md:p-8">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-cgp-badge-overdue/30"
              onClick={() => navigate("/dashboard/all-cases")}
            >
              {/* Icon */}
              <div className="bg-cgp-badge-overdue text-white p-2 rounded-lg">
                <Search className="w-5 h-5" />
              </div>

              {/* Case Info */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <p className="font-calibri-bold text-foreground">{item.caseNumber}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{item.clientName}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Keresés indult</p>
                  <p className="font-calibri-bold">{item.searchStarted}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Határidő</p>
                  <p className="font-calibri-bold text-cgp-badge-overdue">{item.deadline}</p>
                </div>
              </div>

              {/* Days Overdue */}
              <div className="bg-cgp-badge-overdue text-white px-4 py-2 rounded-lg font-calibri-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {item.daysOverdue} nap késés
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchDeadlinePanel;
