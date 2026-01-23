import { useState } from "react";
import { CrmTab, CrmLead } from "@/types/crm";
import { mockColleagues } from "@/data/crmMockData";
import CrmFilterBar from "@/components/crm/CrmFilterBar";
import CrmTabs from "@/components/crm/CrmTabs";
import LeadsTab from "@/components/crm/LeadsTab";
import OffersTab from "@/components/crm/OffersTab";
import DealsTab from "@/components/crm/DealsTab";
import SignedTab from "@/components/crm/SignedTab";
import TodoListTab from "@/components/crm/TodoListTab";
import ReportsTab from "@/components/crm/ReportsTab";
import { useCrmLeads } from "@/hooks/useCrmLeads";

const CrmPage = () => {
  const [activeTab, setActiveTab] = useState<CrmTab>('leads');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedColleague, setSelectedColleague] = useState<string | null>(null);
  
  const { leadsList, offersList, dealsList, signedList, addLead, updateLead, changeLeadStatus, deleteLead } = useCrmLeads();

  // Get colleague name for header
  const colleagueName = selectedColleague 
    ? mockColleagues.find(c => c.id === selectedColleague)?.name 
    : null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leads':
        return <LeadsTab leads={leadsList} onAddLead={addLead} onUpdateLead={updateLead} onChangeLeadStatus={changeLeadStatus} onDeleteLead={deleteLead} />;
      case 'offers':
        return <OffersTab offers={offersList} onUpdateLead={updateLead} onChangeLeadStatus={changeLeadStatus} onDeleteLead={deleteLead} />;
      case 'deals':
        return <DealsTab deals={dealsList} onUpdateLead={updateLead} onChangeLeadStatus={changeLeadStatus} onDeleteLead={deleteLead} />;
      case 'todolist':
        return <TodoListTab />;
      case 'signed':
        return <SignedTab signedLeads={signedList} onUpdateLead={updateLead} onChangeLeadStatus={changeLeadStatus} onDeleteLead={deleteLead} />;
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
