import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserX, Clock, XCircle, Calendar, FileText, MapPin, User } from "lucide-react";
import { CaseWarning } from "@/data/operativeMockData";
import { useNavigate } from "react-router-dom";

interface CaseWarningsPanelProps {
  warnings: CaseWarning[];
}

const warningTabs = [
  { id: 'not_dispatched', label: 'Kiközvetítetlen', icon: UserX, color: 'text-cgp-badge-overdue' },
  { id: '24h', label: '24 óra!', icon: Clock, color: 'text-cgp-badge-lastday' },
  { id: '5day', label: '5 nap!', icon: Clock, color: 'text-cgp-badge-lastday' },
  { id: 'rejected', label: 'Elutasított', icon: XCircle, color: 'text-cgp-badge-overdue' },
  { id: '2month', label: '2 hónap+', icon: Calendar, color: 'text-cgp-badge-lastday' },
  { id: '3month', label: '3 hónap+', icon: Calendar, color: 'text-cgp-badge-overdue' },
];

const CaseWarningsPanel = ({ warnings }: CaseWarningsPanelProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('not_dispatched');

  const getWarningsByType = (type: string) => warnings.filter(w => w.warningType === type);

  const renderCaseList = (cases: CaseWarning[]) => {
    if (cases.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-8">
          Nincs ilyen típusú figyelmeztetés.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {cases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
            onClick={() => navigate("/dashboard/all-cases")}
          >
            {/* Case Icon */}
            <div className="bg-cgp-badge-overdue text-white p-2 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>

            {/* Case Info */}
            <div className="flex-1 min-w-[200px]">
              <p className="font-calibri-bold text-foreground">
                {caseItem.caseNumber}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{caseItem.clientName}</span>
                <span className="mx-1">•</span>
                <MapPin className="w-3 h-3" />
                <span>{caseItem.country}</span>
              </div>
            </div>

            {/* Expert (if assigned) */}
            {caseItem.expertName && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Szakértő:</span> {caseItem.expertName}
              </div>
            )}

            {/* Days open (for long cases) */}
            {caseItem.daysOpen && (
              <div className="bg-cgp-badge-overdue text-white px-3 py-1 rounded-lg text-sm font-calibri-bold">
                {caseItem.daysOpen} nap
              </div>
            )}

            {/* Opened date */}
            <div className="text-sm text-muted-foreground">
              Megnyitva: {caseItem.openedDate}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div id="case-warnings-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-badge-overdue text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <FileText className="w-6 h-6 md:w-8 md:h-8" />
          Eset figyelmeztetések: {warnings.length}
        </h2>
        <button
          onClick={() => navigate("/dashboard/all-cases")}
          className="text-cgp-link hover:text-cgp-link-hover hover:underline pb-2 text-sm"
        >
          Összes eset →
        </button>
      </div>

      {/* Panel Content with Tabs */}
      <div className="bg-cgp-badge-overdue/20 p-6 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-wrap h-auto bg-white/50">
            {warningTabs.map((tab) => {
              const Icon = tab.icon;
              const count = getWarningsByType(tab.id).length;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <Icon className={`w-4 h-4 ${tab.color}`} />
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-cgp-badge-overdue/20 ${tab.color}`}>
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {warningTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {renderCaseList(getWarningsByType(tab.id))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default CaseWarningsPanel;
