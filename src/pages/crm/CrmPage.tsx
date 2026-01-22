import { useState } from "react";
import { CrmTab, CrmLead } from "@/types/crm";
import { mockSignedCompanies, mockTodoItems, mockColleagues } from "@/data/crmMockData";
import CrmFilterBar from "@/components/crm/CrmFilterBar";
import CrmTabs from "@/components/crm/CrmTabs";
import LeadsTab from "@/components/crm/LeadsTab";
import OffersTab from "@/components/crm/OffersTab";
import DealsTab from "@/components/crm/DealsTab";
import TodoListTab from "@/components/crm/TodoListTab";
import CompaniesTab from "@/components/crm/CompaniesTab";
import ReportsTab from "@/components/crm/ReportsTab";
import { useCrmLeads } from "@/hooks/useCrmLeads";

const CrmPage = () => {
  const [activeTab, setActiveTab] = useState<CrmTab>('leads');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedColleague, setSelectedColleague] = useState<string | null>(null);
  
  const { leadsList, offersList, dealsList, addLead, updateLead, deleteLead } = useCrmLeads();

  // Get colleague name for header
  const colleagueName = selectedColleague 
    ? mockColleagues.find(c => c.id === selectedColleague)?.name 
    : null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leads':
        return <LeadsTab leads={leadsList} onAddLead={addLead} onUpdateLead={updateLead} onDeleteLead={deleteLead} />;
      case 'offers':
        return <OffersTab offers={offersList} />;
      case 'deals':
        return <DealsTab deals={dealsList} />;
      case 'todolist':
        return <TodoListTab items={mockTodoItems} />;
      case 'companies':
        return <CompaniesTab deals={dealsList} signedCompanies={mockSignedCompanies} />;
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
