import { CrmTab } from "@/types/crm";
import { cn } from "@/lib/utils";

interface CrmTabsProps {
  activeTab: CrmTab;
  onTabChange: (tab: CrmTab) => void;
}

const tabs: { id: CrmTab; label: string }[] = [
  { id: 'leads', label: 'LEADS' },
  { id: 'offers', label: 'OFFERS' },
  { id: 'deals', label: 'DEALS' },
  { id: 'todolist', label: 'TO DO LIST' },
  { id: 'companies', label: 'COMPANIES' },
  { id: 'reports', label: 'REPORTS' },
];

const CrmTabs = ({ activeTab, onTabChange }: CrmTabsProps) => {
  return (
    <div className="flex border-b-0 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-calibri-bold transition-colors text-center",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CrmTabs;
