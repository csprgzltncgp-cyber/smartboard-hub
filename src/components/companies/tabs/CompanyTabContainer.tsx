import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface CompanyTab {
  id: string;
  label: string;
  visible: boolean;
  content: React.ReactNode;
}

interface CompanyTabContainerProps {
  tabs: CompanyTab[];
  defaultTab?: string;
  className?: string;
}

export const CompanyTabContainer = ({
  tabs,
  defaultTab,
  className,
}: CompanyTabContainerProps) => {
  const visibleTabs = tabs.filter((tab) => tab.visible);
  const defaultValue = defaultTab || visibleTabs[0]?.id || "";

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <Tabs defaultValue={defaultValue} className={cn("w-full", className)}>
      <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-t-xl flex-wrap gap-1">
        {visibleTabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {visibleTabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="bg-card border border-t-0 rounded-b-lg p-6 mt-0"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
