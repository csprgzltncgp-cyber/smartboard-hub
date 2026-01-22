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
    <div className="flex items-end gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "py-3 md:py-4 px-4 md:px-6 text-base md:text-lg lg:text-xl font-calibri-bold transition-colors text-center rounded-t-[20px]",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CrmTabs;
