import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Video, Phone, MessageSquare, User, MapPin } from "lucide-react";

export interface ConsultationSettings {
  acceptsPersonalConsultation: boolean;
  acceptsVideoConsultation: boolean;
  acceptsPhoneConsultation: boolean;
  acceptsChatConsultation: boolean;
  videoConsultationType: "eap_online_only" | "operator_only" | "both";
  acceptsOnsiteConsultation: boolean;
}

interface ConsultationTypeSettingsProps {
  settings: ConsultationSettings;
  onChange: (settings: ConsultationSettings) => void;
}

export const ConsultationTypeSettings = ({
  settings,
  onChange,
}: ConsultationTypeSettingsProps) => {
  const updateSetting = <K extends keyof ConsultationSettings>(
    key: K,
    value: ConsultationSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl border p-6 space-y-6">
      <h2 className="text-lg font-semibold mb-4">Tanácsadási típusok</h2>
      
      <p className="text-sm text-muted-foreground mb-4">
        Válaszd ki, milyen típusú tanácsadást vállal a szakértő. Több típus is kiválasztható.
      </p>

      <div className="space-y-4">
        {/* Személyes tanácsadás */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
            <Checkbox
              id="acceptsPersonalConsultation"
              checked={settings.acceptsPersonalConsultation}
              onCheckedChange={(checked) =>
                updateSetting("acceptsPersonalConsultation", checked as boolean)
              }
            />
            <User className="w-5 h-5 text-cgp-teal" />
            <Label htmlFor="acceptsPersonalConsultation" className="cursor-pointer flex-1">
              Személyes tanácsadás
            </Label>
          </div>

          {/* On-site opció - csak ha személyes ki van választva */}
          {settings.acceptsPersonalConsultation && (
            <div className="ml-8 p-3 border border-dashed rounded-lg bg-muted/20">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="acceptsOnsiteConsultation"
                  checked={settings.acceptsOnsiteConsultation}
                  onCheckedChange={(checked) =>
                    updateSetting("acceptsOnsiteConsultation", checked as boolean)
                  }
                />
                <MapPin className="w-4 h-4 text-orange-500" />
                <Label htmlFor="acceptsOnsiteConsultation" className="cursor-pointer text-sm">
                  Vállal helyszíni (on-site) tanácsadást
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Videós tanácsadás */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
            <Checkbox
              id="acceptsVideoConsultation"
              checked={settings.acceptsVideoConsultation}
              onCheckedChange={(checked) =>
                updateSetting("acceptsVideoConsultation", checked as boolean)
              }
            />
            <Video className="w-5 h-5 text-cgp-teal" />
            <Label htmlFor="acceptsVideoConsultation" className="cursor-pointer flex-1">
              Videós tanácsadás
            </Label>
          </div>

          {/* Video típus opciók - csak ha videós ki van választva */}
          {settings.acceptsVideoConsultation && (
            <div className="ml-8 p-3 border border-dashed rounded-lg bg-muted/20">
              <Label className="text-sm font-medium mb-3 block">Videós esetek típusa:</Label>
              <RadioGroup
                value={settings.videoConsultationType}
                onValueChange={(value) =>
                  updateSetting(
                    "videoConsultationType",
                    value as "eap_online_only" | "operator_only" | "both"
                  )
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="eap_online_only" id="video_eap_only" />
                  <Label htmlFor="video_eap_only" className="cursor-pointer text-sm">
                    Csak EAP Online esetek
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="operator_only" id="video_operator_only" />
                  <Label htmlFor="video_operator_only" className="cursor-pointer text-sm">
                    Csak Operátor által kiközvetített esetek
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="video_both" />
                  <Label htmlFor="video_both" className="cursor-pointer text-sm">
                    Mindkettő
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        {/* Telefonos tanácsadás */}
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
          <Checkbox
            id="acceptsPhoneConsultation"
            checked={settings.acceptsPhoneConsultation}
            onCheckedChange={(checked) =>
              updateSetting("acceptsPhoneConsultation", checked as boolean)
            }
          />
          <Phone className="w-5 h-5 text-cgp-teal" />
          <Label htmlFor="acceptsPhoneConsultation" className="cursor-pointer flex-1">
            Telefonos tanácsadás
          </Label>
        </div>

        {/* Chat alapú tanácsadás */}
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
          <Checkbox
            id="acceptsChatConsultation"
            checked={settings.acceptsChatConsultation}
            onCheckedChange={(checked) =>
              updateSetting("acceptsChatConsultation", checked as boolean)
            }
          />
          <MessageSquare className="w-5 h-5 text-cgp-teal" />
          <Label htmlFor="acceptsChatConsultation" className="cursor-pointer flex-1">
            Szöveges üzenetváltás (Chat) alapú tanácsadás
          </Label>
        </div>
      </div>

      {/* Összefoglaló */}
      {(settings.acceptsPersonalConsultation ||
        settings.acceptsVideoConsultation ||
        settings.acceptsPhoneConsultation ||
        settings.acceptsChatConsultation) && (
        <div className="p-3 bg-cgp-teal/10 rounded-lg text-sm">
          <span className="font-medium">Kiválasztott típusok: </span>
          {[
            settings.acceptsPersonalConsultation && (
              settings.acceptsOnsiteConsultation ? "Személyes (+ on-site)" : "Személyes"
            ),
            settings.acceptsVideoConsultation && (
              settings.videoConsultationType === "eap_online_only"
                ? "Videós (EAP Online)"
                : settings.videoConsultationType === "operator_only"
                ? "Videós (Operátor)"
                : "Videós (mindkettő)"
            ),
            settings.acceptsPhoneConsultation && "Telefonos",
            settings.acceptsChatConsultation && "Chat",
          ]
            .filter(Boolean)
            .join(", ")}
        </div>
      )}
    </div>
  );
};

export const defaultConsultationSettings: ConsultationSettings = {
  acceptsPersonalConsultation: false,
  acceptsVideoConsultation: false,
  acceptsPhoneConsultation: false,
  acceptsChatConsultation: false,
  videoConsultationType: "both",
  acceptsOnsiteConsultation: false,
};
