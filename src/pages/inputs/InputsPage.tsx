import { ListChecks, Plus, Globe, Database, Lock, Pencil, Trash2, Save, X } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; type: InputType }>({ name: "", type: "text" });
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const [selectedInput, setSelectedInput] = useState<CaseInput | null>(null);
  const [translations, setTranslations] = useState<{ [lang: string]: string }>({});

  const handlePersonalDataToggle = (id: number, checked: boolean) => {
    setInputs(inputs.map(input => 
      input.id === id ? { ...input, isPersonalData: checked } : input
    ));
    toast.success("Beállítás mentve");
  };

  const startEditing = (input: CaseInput) => {
    setEditingId(input.id);
    setEditForm({ name: input.name, type: input.type });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ name: "", type: "text" });
  };

  const saveEditing = () => {
    if (editingId && editForm.name.trim()) {
      setInputs(inputs.map(input =>
        input.id === editingId ? { ...input, name: editForm.name, type: editForm.type } : input
      ));
      setEditingId(null);
      toast.success("Input mentve");
    }
  };

  const deleteInput = (id: number) => {
    setInputs(inputs.filter(input => input.id !== id));
    toast.success("Input törölve");
  };

  const openTranslationDialog = (input: CaseInput) => {
    setSelectedInput(input);
    setTranslations(input.translations || { hu: input.name, en: "", de: "" });
    setTranslationDialogOpen(true);
  };

  const saveTranslations = () => {
    if (selectedInput) {
      setInputs(inputs.map(input =>
        input.id === selectedInput.id ? { ...input, translations } : input
      ));
      setTranslationDialogOpen(false);
      setSelectedInput(null);
      toast.success("Fordítások mentve");
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

  const addNewInput = () => {
    const newId = Math.max(...inputs.map(i => i.id)) + 1;
    const newInput: CaseInput = {
      id: newId,
      name: "Új input",
      type: "text",
      isPersonalData: false,
    };
    setInputs([...inputs, newInput]);
    startEditing(newInput);
    toast.success("Új input létrehozva");
  };

  return (
    <div>
      <h1 className="text-2xl font-calibri-bold text-foreground mb-2 flex items-center gap-2">
        <ListChecks className="w-6 h-6" />
        Inputok
      </h1>
      <a 
        href="#" 
        className="text-link hover:text-link-hover hover:underline text-sm inline-flex items-center gap-1 mb-6"
        onClick={(e) => {
          e.preventDefault();
          addNewInput();
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
              <TableHead className="w-32 text-center">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inputs.map((input, index) => (
              <TableRow key={input.id} className={input.type === "database" ? "bg-muted/30" : ""}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">
                  {editingId === input.id ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="max-w-xs"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {input.name}
                      {input.type === "database" && (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === input.id ? (
                    <Select
                      value={editForm.type}
                      onValueChange={(value: InputType) => setEditForm({ ...editForm, type: value })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border shadow-lg z-50">
                        <SelectItem value="text">Szöveg</SelectItem>
                        <SelectItem value="dropdown">Legördülő</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getTypeBadge(input.type)
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={input.isPersonalData}
                    onCheckedChange={(checked) => handlePersonalDataToggle(input.id, checked)}
                    disabled={input.type === "database"}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {editingId === input.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-primary hover:text-primary"
                          onClick={saveEditing}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl"
                          onClick={cancelEditing}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => openTranslationDialog(input)}
                          disabled={input.type === "database"}
                          title="Fordítások"
                        >
                          <Globe className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => startEditing(input)}
                          disabled={input.type === "database"}
                          title="Szerkesztés"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-destructive hover:text-destructive"
                          onClick={() => deleteInput(input.id)}
                          disabled={input.type === "database"}
                          title="Törlés"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
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

      {/* Translation Dialog */}
      <Dialog open={translationDialogOpen} onOpenChange={setTranslationDialogOpen}>
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
              <Save className="w-4 h-4 mr-2" />
              Mentés
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InputsPage;
