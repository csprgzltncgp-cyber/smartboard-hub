import { useState } from "react";
import { Contact } from "lucide-react";
import { CrmTab } from "@/types/crm";
import { mockLeads, mockOffers, mockDeals, mockSignedCompanies, mockTodoItems, mockColleagues } from "@/data/crmMockData";
import CrmFilterBar from "@/components/crm/CrmFilterBar";
import CrmTabs from "@/components/crm/CrmTabs";
import LeadsTab from "@/components/crm/LeadsTab";
import OffersTab from "@/components/crm/OffersTab";
import DealsTab from "@/components/crm/DealsTab";
import TodoListTab from "@/components/crm/TodoListTab";
import CompaniesTab from "@/components/crm/CompaniesTab";
import ReportsTab from "@/components/crm/ReportsTab";

const CrmPage = () => {
  const [activeTab, setActiveTab] = useState<CrmTab>('leads');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedColleague, setSelectedColleague] = useState<string | null>(null);

  // Get colleague name for header
  const colleagueName = selectedColleague 
    ? mockColleagues.find(c => c.id === selectedColleague)?.name 
    : null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leads':
        return <LeadsTab leads={mockLeads} />;
      case 'offers':
        return <OffersTab offers={mockOffers} />;
      case 'deals':
        return <DealsTab deals={mockDeals} />;
      case 'todolist':
        return <TodoListTab items={mockTodoItems} />;
      case 'companies':
        return <CompaniesTab deals={mockDeals} signedCompanies={mockSignedCompanies} />;
      case 'reports':
        return <ReportsTab />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <h1 className="text-2xl font-calibri-bold text-foreground mb-2 flex items-center gap-2">
        CRM - {selectedCountry || 'Hungary'} - {colleagueName || 'Janky Péter'}
      </h1>
      
      {/* Filter Bar */}
      <CrmFilterBar
        selectedCountry={selectedCountry}
        selectedColleague={selectedColleague}
        onCountryChange={setSelectedCountry}
        onColleagueChange={setSelectedColleague}
      />

      {/* Tabs */}
      <CrmTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CrmPage;
