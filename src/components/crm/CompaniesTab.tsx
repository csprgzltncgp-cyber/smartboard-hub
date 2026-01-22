import { CrmSignedCompany, CrmLead } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Plus, Search, Mail, Video, Phone, Smile, Calendar, ThumbsUp, FileText, Eye, ChevronDown, ChevronUp, Home } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import CrmProgressBar from "./CrmProgressBar";

interface CompaniesTabProps {
  deals: CrmLead[];
  signedCompanies: CrmSignedCompany[];
}

const CompaniesTab = ({ deals, signedCompanies }: CompaniesTabProps) => {
  const [showDeals, setShowDeals] = useState(true);
  const [showSigned, setShowSigned] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      {/* Action Bar */}
      <div className="flex gap-2 mb-4">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
          <Plus className="w-4 h-4 mr-2" />
          New company
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none p-2">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Collapsible Arrow */}
      <div className="flex justify-center mb-2">
        <button className="p-1 hover:bg-muted rounded">
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Deals Section */}
      <div className="mb-6">
        <h3 className="text-lg font-calibri-bold text-foreground mb-3">
          Deals - {deals.length} db
        </h3>
        <div className="border border-border rounded-sm overflow-hidden">
          {deals.map((deal) => (
            <div 
              key={deal.id}
              className="flex items-center gap-4 py-3 px-4 bg-muted/30 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
            >
              <span className="flex-1 text-sm">Company: {deal.companyName}</span>
              <span className="text-sm text-muted-foreground">CGP: {deal.assignedTo}</span>
              <span className="text-sm text-muted-foreground">{deal.details.pillars} PILL/{deal.details.sessions} SESS</span>
              
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <Smile className="w-4 h-4 text-muted-foreground" />
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <span className="text-lg font-calibri-bold min-w-[60px] text-right">
                {deal.progress}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Signed Section */}
      <div>
        <h3 className="text-lg font-calibri-bold text-foreground mb-3">
          Signed - {signedCompanies.length} db
        </h3>
        <div className="border border-border rounded-sm overflow-hidden">
          {signedCompanies.map((company) => {
            const isExpanded = expandedId === company.id;
            
            return (
              <div key={company.id} className="border-b border-border last:border-b-0">
                {/* Company Row */}
                <div 
                  className="flex items-center gap-4 py-3 px-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : company.id)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-sm flex items-center justify-center",
                    company.dashboardInfo.isActive ? "bg-primary" : "bg-muted"
                  )}>
                    <Home className="w-4 h-4 text-primary-foreground" />
                  </div>
                  
                  <span className="flex-1 text-sm">Company: {company.companyName}</span>
                  <span className="text-sm text-muted-foreground">CGP: {company.assignedTo}</span>
                  <span className="text-sm text-muted-foreground">{company.details.pillars} PILL/{company.details.sessions} SESS</span>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <Smile className="w-4 h-4 text-muted-foreground" />
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Expanded Company Details */}
                {isExpanded && (
                  <CompanyExpandedDetails company={company} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Expanded company details component
const CompanyExpandedDetails = ({ company }: { company: CrmSignedCompany }) => {
  return (
    <div className="bg-white p-6 space-y-6">
      {/* Company Informations */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-calibri-bold text-lg">Company informations</h4>
          
          <div className="space-y-2">
            <div className="p-3 bg-muted/30 rounded-sm text-sm">
              Name of company: {company.companyName}
            </div>
            <div className="p-3 bg-muted/30 rounded-sm text-sm">
              City: {company.details.city}
            </div>
            <div className="p-3 bg-muted/30 rounded-sm text-sm">
              Country: {company.details.country}
            </div>
            <div className="p-3 bg-muted/30 rounded-sm text-sm">
              Industry: {company.details.industry}
            </div>
            <div className="p-3 bg-muted/30 rounded-sm text-sm">
              Headcount: {company.details.headcount}
            </div>
            <div className="p-3 bg-muted/30 rounded-sm text-sm">
              Service: {company.details.pillars} PILL/{company.details.sessions} SESS
            </div>
            <div className="p-3 bg-muted/30 rounded-sm text-sm">
              CGP responsible: {company.cgpResponsible}
            </div>
            <div className="p-3 bg-muted/30 rounded-sm text-sm flex items-center gap-2">
              <span>Pricing: {company.pricing}</span>
              <FileText className="w-4 h-4 text-primary ml-auto" />
              <FileText className="w-4 h-4 text-primary" />
            </div>
          </div>
          
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add new detail
          </Button>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h4 className="font-calibri-bold text-lg">Note</h4>
          {company.notes.length > 0 ? (
            <div className="p-4 bg-muted/30 rounded-sm text-sm">
              <p className="text-muted-foreground">{company.notes[0].content}</p>
            </div>
          ) : (
            <div className="p-4 bg-muted/30 rounded-sm text-sm text-muted-foreground">
              No notes yet
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <FileText className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-muted" />
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* Contact Informations */}
      {company.contacts.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-calibri-bold text-lg">Contact informations</h4>
          
          {company.contacts.map((contact) => (
            <div key={contact.id} className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="p-3 bg-muted/30 rounded-sm text-sm">
                  Name: {contact.name}
                </div>
                <div className="p-3 bg-muted/30 rounded-sm text-sm">
                  Title: {contact.title}
                </div>
                <div className="p-3 bg-muted/30 rounded-sm text-sm flex items-center gap-4">
                  <span>Gender</span>
                  <button className={cn(
                    "p-2 rounded-sm",
                    contact.gender === 'female' ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    ♀
                  </button>
                  <button className={cn(
                    "p-2 rounded-sm",
                    contact.gender === 'male' ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    ♂
                  </button>
                </div>
                <div className="p-3 bg-muted/30 rounded-sm text-sm">
                  Company: {company.companyName}
                </div>
                <div className="p-3 bg-muted/30 rounded-sm text-sm">
                  Phone: {contact.phone}
                </div>
                <div className="p-3 bg-muted/30 rounded-sm text-sm">
                  Email: {contact.email}
                </div>
                <div className="p-3 bg-muted/30 rounded-sm text-sm">
                  Address: {contact.address}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-calibri-bold text-lg">Note</h4>
                <div className="p-4 bg-muted/30 rounded-sm text-sm text-muted-foreground">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium...
                </div>
              </div>
            </div>
          ))}
          
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
            <Plus className="w-4 h-4 mr-2" />
            Add further contact
          </Button>
        </div>
      )}

      {/* Dashboard Informations */}
      <div className="space-y-4">
        <h4 className="font-calibri-bold text-lg">Dashboard informations</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3">Country</th>
                <th className="text-left p-3">Pillar</th>
                <th className="text-left p-3">Sessions</th>
                <th className="text-center p-3">Phone</th>
                <th className="text-center p-3">Video</th>
                <th className="text-center p-3">Crisis</th>
              </tr>
            </thead>
            <tbody>
              {company.dashboardInfo.countries.map((country, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="p-3">{country.name}</td>
                  <td className="p-3">{country.pillar}</td>
                  <td className="p-3">{country.sessions}</td>
                  <td className="p-3 text-center">
                    {country.hasPhone && (
                      <div className="w-6 h-6 bg-primary rounded-sm mx-auto flex items-center justify-center">
                        <Phone className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {country.hasVideo && (
                      <div className="w-6 h-6 bg-primary rounded-sm mx-auto flex items-center justify-center">
                        <Video className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {country.hasCrisis && (
                      <div className="w-6 h-6 bg-primary rounded-sm mx-auto flex items-center justify-center">
                        <Plus className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-muted/30 rounded-sm text-sm">
            Contract holder: {company.dashboardInfo.contractHolder}
          </div>
          <div className="p-3 bg-muted/30 rounded-sm text-sm">
            Contract date: {company.dashboardInfo.contractDate}
          </div>
          <div className="p-3 bg-muted/30 rounded-sm text-sm">
            Active: {company.dashboardInfo.isActive ? 'Yes' : 'No'}
          </div>
          <div className="p-3 bg-muted/30 rounded-sm text-sm">
            Numbers of workshops: {company.dashboardInfo.workshopsNumber}
          </div>
          <div className="p-3 bg-muted/30 rounded-sm text-sm col-span-2">
            Numbers of crisis interventions: {company.dashboardInfo.crisisInterventionsNumber}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none px-12">
          <Home className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CompaniesTab;
