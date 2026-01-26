import { ListChecks, Plus, Globe, Database, Lock } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type InputType = "text" | "dropdown" | "database";

interface CaseInput {
  id: number;
  name: string;
  type: InputType;
  isPersonalData: boolean;
  translations?: { [lang: string]: string };
}

const defaultInputs: CaseInput[] = [
  { id: 1, name: "A cég neve", type: "dropdown", isPersonalData: false },
  { id: 2, name: "Az eset létrehozásának dátuma", type: "dropdown", isPersonalData: false },
  { id: 3, name: "Eset típusa", type: "dropdown", isPersonalData: false },
  { id: 4, name: "Kliens neve", type: "text", isPersonalData: true },
  { id: 5, name: "Kliens lakhelye", type: "text", isPersonalData: true },
  { id: 6, name: "Krízis?", type: "dropdown", isPersonalData: false },
  { id: 7, name: "Probléma", type: "dropdown", isPersonalData: false },
  { id: 8, name: "Kért tanácsadás nyelve", type: "database", isPersonalData: false },
  { id: 9, name: "Ügyfél e-mail címe", type: "text", isPersonalData: true },
  { id: 10, name: "Specializáció", type: "database", isPersonalData: false },
  { id: 11, name: "Kliens neme", type: "dropdown", isPersonalData: false },
  { id: 12, name: "Kliens kora", type: "dropdown", isPersonalData: false },
  { id: 13, name: "Családi állapot", type: "dropdown", isPersonalData: false },
  { id: 14, name: "Iskolai végzettség", type: "dropdown", isPersonalData: false },
  { id: 15, name: "Beosztás", type: "dropdown", isPersonalData: false },
  { id: 16, name: "Munkaviszony hossza", type: "dropdown", isPersonalData: false },
  { id: 17, name: "Hogyan értesült a szolgáltatásról?", type: "dropdown", isPersonalData: false },
  { id: 18, name: "Használta-e már a szolgáltatást?", type: "dropdown", isPersonalData: false },
  { id: 19, name: "Ajánlaná-e a szolgáltatást?", type: "dropdown", isPersonalData: false },
  { id: 20, name: "Eset összefoglalás", type: "text", isPersonalData: false },
  { id: 21, name: "UCMS eset azonosító", type: "text", isPersonalData: false },
  { id: 22, name: "További információ szükséges a klienstől?", type: "dropdown", isPersonalData: false },
  { id: 23, name: "Eset státusza", type: "dropdown", isPersonalData: false },
  { id: 24, name: "Konzultáció helyszíne", type: "text", isPersonalData: false },
  { id: 25, name: "Konzultáció időtartama", type: "dropdown", isPersonalData: false },
  { id: 26, name: "Konzultáció típusa", type: "dropdown", isPersonalData: false },
  { id: 27, name: "Következő lépések", type: "text", isPersonalData: false },
  { id: 28, name: "Megjegyzések", type: "text", isPersonalData: false },
];

const languages = [
  { code: "hu", name: "Magyar" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
];

const InputsPage = () => {
  const [inputs, setInputs] = useState<CaseInput[]>(defaultInputs);
  const [selectedInput, setSelectedInput] = useState<CaseInput | null>(null);
  const [translations, setTranslations] = useState<{ [lang: string]: string }>({});

  const handlePersonalDataToggle = (id: number, checked: boolean) => {
    setInputs(inputs.map(input => 
      input.id === id ? { ...input, isPersonalData: checked } : input
    ));
  };

  const openTranslationDialog = (input: CaseInput) => {
    setSelectedInput(input);
    setTranslations(input.translations || { hu: input.name, en: "", de: "" });
  };

  const saveTranslations = () => {
    if (selectedInput) {
      setInputs(inputs.map(input =>
        input.id === selectedInput.id ? { ...input, translations } : input
      ));
      setSelectedInput(null);
    }
  };

  const getTypeBadge = (type: InputType) => {
    switch (type) {
      case "text":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Szöveg</Badge>;
      case "dropdown":
        return <Badge variant="outline" className="bg-accent text-accent-foreground border-accent">Legördülő</Badge>;
      case "database":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">
            <Database className="w-3 h-3 mr-1" />
            Adatbázis
          </Badge>
        );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-calibri-bold text-foreground mb-2 flex items-center gap-2">
        <ListChecks className="w-6 h-6" />
        Inputok
      </h1>
      <a 
        href="#" 
        className="text-primary hover:underline text-sm inline-flex items-center gap-1 mb-6"
        onClick={(e) => {
          e.preventDefault();
          // TODO: Navigate to new input creation
        }}
      >
        <Plus className="w-4 h-4" />
        Új input létrehozása
      </a>
      
      <div className="bg-card rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Név</TableHead>
              <TableHead className="w-32">Típus</TableHead>
              <TableHead className="w-40 text-center">3 hónap után törlendő</TableHead>
              <TableHead className="w-24 text-center">Fordítás</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inputs.map((input, index) => (
              <TableRow key={input.id} className={input.type === "database" ? "bg-muted/30" : ""}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {input.name}
                    {input.type === "database" && (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(input.type)}</TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={input.isPersonalData}
                    onCheckedChange={(checked) => handlePersonalDataToggle(input.id, checked)}
                    disabled={input.type === "database"}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => openTranslationDialog(input)}
                        disabled={input.type === "database"}
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Fordítások: {selectedInput?.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {languages.map((lang) => (
                          <div key={lang.code} className="space-y-2">
                            <Label htmlFor={lang.code}>{lang.name}</Label>
                            <Input
                              id={lang.code}
                              value={translations[lang.code] || ""}
                              onChange={(e) => setTranslations({
                                ...translations,
                                [lang.code]: e.target.value
                              })}
                              placeholder={`${lang.name} fordítás...`}
                            />
                          </div>
                        ))}
                        <Button onClick={saveTranslations} className="w-full rounded-xl">
                          Mentés
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        <Lock className="w-3 h-3 inline mr-1" />
        Az adatbázisból érkező inputok (Kért tanácsadás nyelve, Specializáció) nem szerkeszthetők.
      </p>
    </div>
  );
};

export default InputsPage;
