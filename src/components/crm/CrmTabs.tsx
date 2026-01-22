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
  { id: 'signed', label: 'SIGNED' },
  { id: 'todolist', label: 'TO DO LIST' },
  { id: 'reports', label: 'REPORTS' },
];

const CrmTabs = ({ activeTab, onTabChange }: CrmTabsProps) => {
  return (
    <div className="flex items-end gap-0.5 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "py-2.5 px-5 text-sm font-calibri-bold transition-colors text-center rounded-t-md",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground border-t border-l border-r border-primary"
              : "bg-muted/60 text-muted-foreground hover:bg-muted border-t border-l border-r border-transparent"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CrmTabs;
