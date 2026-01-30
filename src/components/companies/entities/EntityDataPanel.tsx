import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { ContractedEntity, WorkshopData, CrisisData } from "@/types/contracted-entity";
import { ContractHolder, ConsultationRow, PriceHistoryEntry, CURRENCIES, INDUSTRIES } from "@/types/company";
import { ContractDataPanel } from "../panels/ContractDataPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EntityDataPanelProps {
  entity: ContractedEntity;
  contractHolders: ContractHolder[];
  onUpdate: (updates: Partial<ContractedEntity>) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export const EntityDataPanel = ({
  entity,
  contractHolders,
  onUpdate,
  onDelete,
  canDelete,
}: EntityDataPanelProps) => {
  // Extract consultation rows from entity
  const consultationRows: ConsultationRow[] = entity.consultation_rows || [];
  const priceHistory: PriceHistoryEntry[] = entity.price_history || [];

  const handleConsultationRowsChange = (rows: ConsultationRow[]) => {
    onUpdate({ consultation_rows: rows });
  };

  const handlePriceHistoryChange = (history: PriceHistoryEntry[]) => {
    onUpdate({ price_history: history });
  };

  return (
    <div className="space-y-6">
      {/* Entitás azonosítás */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Entitás neve *</Label>
          <Input
            value={entity.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="pl. Henkel Hungary Kft."
          />
          <p className="text-xs text-muted-foreground">
            A jogi személy neve, akivel a szerződést kötötték
          </p>
        </div>
        <div className="space-y-2">
          <Label>ORG ID</Label>
          <Input
            value={entity.org_id || ""}
            onChange={(e) => onUpdate({ org_id: e.target.value || null })}
            placeholder="ORG ID"
          />
        </div>
      </div>

      {/* Szerződés dátumok */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Szerződés kezdete</Label>
          <Input
            type="date"
            value={entity.contract_date || ""}
            onChange={(e) => onUpdate({ contract_date: e.target.value || null })}
          />
        </div>
        <div className="space-y-2">
          <Label>Szerződés lejárta</Label>
          <Input
            type="date"
            value={entity.contract_end_date || ""}
            onChange={(e) => onUpdate({ contract_end_date: e.target.value || null })}
          />
        </div>
      </div>

      {/* Szerződés adatai - Teljes ContractDataPanel */}
      <ContractDataPanel
        contractHolderId={entity.contract_holder_type}
        setContractHolderId={(id) => onUpdate({ contract_holder_type: id })}
        contractHolders={contractHolders}
        countryDifferentiates={{
          contract_holder: false,
          org_id: false,
          contract_date: false,
          reporting: false,
          invoicing: false,
          contract_date_reminder_email: false,
          basic_data: false,
          has_multiple_entities: false,
          entity_country_ids: [],
        }}
        onUpdateDifferentiate={() => {}}
        contractFileUrl={null}
        setContractFileUrl={() => {}}
        contractPrice={entity.contract_price}
        setContractPrice={(price) => onUpdate({ contract_price: price })}
        contractPriceType={entity.price_type}
        setContractPriceType={(type) => onUpdate({ price_type: type })}
        contractCurrency={entity.contract_currency}
        setContractCurrency={(currency) => onUpdate({ contract_currency: currency })}
        pillarCount={entity.pillars}
        setPillarCount={(count) => onUpdate({ pillars: count })}
        sessionCount={entity.occasions}
        setSessionCount={(count) => onUpdate({ occasions: count })}
        consultationRows={consultationRows}
        setConsultationRows={handleConsultationRowsChange}
        industry={entity.industry}
        setIndustry={(industry) => onUpdate({ industry })}
        priceHistory={priceHistory}
        setPriceHistory={handlePriceHistoryChange}
        showDifferentPerCountry={false}
      />

      {/* Létszám */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Létszám</Label>
          <Input
            type="number"
            value={entity.headcount || ""}
            onChange={(e) => onUpdate({ headcount: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Inaktív létszám</Label>
          <Input
            type="number"
            value={entity.inactive_headcount || ""}
            onChange={(e) => onUpdate({ inactive_headcount: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="0"
          />
        </div>
      </div>

      {/* Workshop adatok */}
      <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
        <h4 className="text-sm font-medium text-primary">Workshop</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Elérhető alkalmak</Label>
            <Input
              type="number"
              value={entity.workshop_data?.sessions_available || ""}
              onChange={(e) => onUpdate({
                workshop_data: {
                  ...entity.workshop_data,
                  sessions_available: e.target.value ? parseInt(e.target.value) : undefined,
                },
              })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Ár</Label>
            <Input
              type="number"
              value={entity.workshop_data?.price || ""}
              onChange={(e) => onUpdate({
                workshop_data: {
                  ...entity.workshop_data,
                  price: e.target.value ? parseFloat(e.target.value) : undefined,
                },
              })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Devizanem</Label>
            <Select
              value={entity.workshop_data?.currency || "none"}
              onValueChange={(val) => onUpdate({
                workshop_data: {
                  ...entity.workshop_data,
                  currency: val === "none" ? undefined : val,
                },
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Válasszon..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Válasszon...</SelectItem>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.id} value={curr.id}>
                    {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Krízis adatok */}
      <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
        <h4 className="text-sm font-medium text-primary">Krízisintervenció</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Elérhető alkalmak</Label>
            <Input
              type="number"
              value={entity.crisis_data?.sessions_available || ""}
              onChange={(e) => onUpdate({
                crisis_data: {
                  ...entity.crisis_data,
                  sessions_available: e.target.value ? parseInt(e.target.value) : undefined,
                },
              })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Ár</Label>
            <Input
              type="number"
              value={entity.crisis_data?.price || ""}
              onChange={(e) => onUpdate({
                crisis_data: {
                  ...entity.crisis_data,
                  price: e.target.value ? parseFloat(e.target.value) : undefined,
                },
              })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Devizanem</Label>
            <Select
              value={entity.crisis_data?.currency || "none"}
              onValueChange={(val) => onUpdate({
                crisis_data: {
                  ...entity.crisis_data,
                  currency: val === "none" ? undefined : val,
                },
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Válasszon..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Válasszon...</SelectItem>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.id} value={curr.id}>
                    {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Törlés gomb */}
      {canDelete && (
        <div className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Entitás törlése
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Entitás törlése</AlertDialogTitle>
                <AlertDialogDescription>
                  Biztosan törölni szeretné a(z) "{entity.name}" entitást? 
                  Ez a művelet nem vonható vissza, és az entitáshoz tartozó számlázási adatok is törlődnek.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Mégse</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Törlés
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};
