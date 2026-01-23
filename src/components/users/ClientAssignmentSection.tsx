import { useState } from "react";
import { Building2, Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCompanies,
  useUserClientAssignments,
  useAssignClientToUser,
  useRemoveClientFromUser,
} from "@/hooks/useActivityPlan";
import { Company } from "@/types/activityPlan";

interface ClientAssignmentSectionProps {
  userId: string;
  userName: string;
}

const ClientAssignmentSection = ({ userId, userName }: ClientAssignmentSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: assignments, isLoading: assignmentsLoading } = useUserClientAssignments(userId);
  const assignClient = useAssignClientToUser();
  const removeClient = useRemoveClientFromUser();

  const assignedCompanyIds = new Set(assignments?.map(a => a.company_id) || []);

  const availableCompanies = companies?.filter(
    c => !assignedCompanyIds.has(c.id) && 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAssign = async (company: Company) => {
    await assignClient.mutateAsync({
      userId,
      companyId: company.id,
    });
  };

  const handleRemove = async (assignmentId: string) => {
    await removeClient.mutateAsync(assignmentId);
  };

  const isLoading = companiesLoading || assignmentsLoading;

  return (
    <div className="bg-white border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Hozzárendelt ügyfelek</h3>
          {assignments && assignments.length > 0 && (
            <Badge variant="secondary">{assignments.length} cég</Badge>
          )}
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Ügyfél hozzárendelése
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ügyfél hozzárendelése</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Keresés cégnév alapján..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <ScrollArea className="h-[300px]">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Betöltés...
                  </div>
                ) : availableCompanies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery 
                      ? "Nincs találat a keresésre" 
                      : "Minden cég már hozzá van rendelve"
                    }
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableCompanies.map(company => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {company.country?.name}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssign(company)}
                          disabled={assignClient.isPending}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assigned clients list */}
      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">Betöltés...</div>
      ) : assignments && assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {assignments.map(assignment => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {assignment.company?.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {assignment.company?.country?.name}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(assignment.id)}
                disabled={removeClient.isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Még nincs hozzárendelt ügyfél</p>
          <p className="text-xs">Kattints a &quot;Ügyfél hozzárendelése&quot; gombra</p>
        </div>
      )}
    </div>
  );
};

export default ClientAssignmentSection;
