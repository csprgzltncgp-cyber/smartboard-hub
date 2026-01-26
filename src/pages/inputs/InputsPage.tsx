import { ListChecks, Plus, Globe, Database, Lock, Pencil, Trash2, Save, X, GripVertical, ChevronDown, ChevronRight } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";

// Based on Laravel migration: enum('type', ['integer', 'date', 'double', 'text', 'select', 'multiple-list', 'boolean'])
// Note: select and multiple-list are combined as "select" (Legördülő) in UI
type InputType = "text" | "integer" | "double" | "date" | "select" | "boolean" | "database";

interface DropdownOption {
  id: number;
  value: string;
  translations?: { [lang: string]: string };
}

interface CaseInput {
  id: number;
  name: string;
  type: InputType;
  isPersonalData: boolean;
  translations?: { [lang: string]: string };
  options?: DropdownOption[]; // For select type
}

const inputTypeLabels: Record<InputType, string> = {
  text: "Szöveg",
  integer: "Egész szám",
  double: "Tizedes szám",
  date: "Dátum",
  select: "Többválasztós",
  boolean: "Igen/Nem",
  database: "Adatbázisból",
};

const defaultInputs: CaseInput[] = [
  { id: 1, name: "A cég neve", type: "select", isPersonalData: false, options: [
    { id: 1, value: "Cég A" },
    { id: 2, value: "Cég B" },
    { id: 3, value: "Cég C" },
  ]},
  { id: 2, name: "Az eset létrehozásának dátuma", type: "date", isPersonalData: false },
  { id: 3, name: "Eset típusa", type: "select", isPersonalData: false, options: [
    { id: 1, value: "EAP" },
    { id: 2, value: "Coaching" },
    { id: 3, value: "Tréning" },
    { id: 4, value: "Konzultáció" },
    { id: 5, value: "Mediáció" },
    { id: 6, value: "Szupervízió" },
    { id: 7, value: "Krízisintervenció" },
    { id: 8, value: "Outplacement" },
    { id: 9, value: "Webinárium" },
    { id: 10, value: "Workshop" },
    { id: 11, value: "Online tartalom" },
    { id: 12, value: "Értékelés" },
    { id: 13, value: "Egyéb" },
  ]},
  { id: 4, name: "Kliens neve", type: "text", isPersonalData: true },
  { id: 5, name: "Kliens lakhelye", type: "text", isPersonalData: true },
  { id: 6, name: "Krízis?", type: "boolean", isPersonalData: false },
  { id: 7, name: "Probléma", type: "select", isPersonalData: false, options: [
    { id: 1, value: "Munkahelyi stressz" },
    { id: 2, value: "Családi problémák" },
    { id: 3, value: "Mentális egészség" },
    { id: 4, value: "Egyéb" },
  ]},
  { id: 8, name: "Kért tanácsadás nyelve", type: "database", isPersonalData: false },
  { id: 9, name: "Ügyfél e-mail címe", type: "text", isPersonalData: true },
  { id: 10, name: "Specializáció", type: "database", isPersonalData: false },
  { id: 11, name: "Kliens neme", type: "select", isPersonalData: false, options: [
    { id: 1, value: "Férfi" },
    { id: 2, value: "Nő" },
    { id: 3, value: "Egyéb" },
  ]},
  { id: 12, name: "Kliens kora", type: "integer", isPersonalData: false },
  { id: 13, name: "Családi állapot", type: "select", isPersonalData: false, options: [
    { id: 1, value: "Egyedülálló" },
    { id: 2, value: "Házas" },
    { id: 3, value: "Elvált" },
    { id: 4, value: "Özvegy" },
  ]},
  { id: 14, name: "Iskolai végzettség", type: "select", isPersonalData: false, options: [
    { id: 1, value: "Alapfokú" },
    { id: 2, value: "Középfokú" },
    { id: 3, value: "Felsőfokú" },
  ]},
  { id: 15, name: "Beosztás", type: "select", isPersonalData: false, options: [] },
  { id: 16, name: "Munkaviszony hossza", type: "select", isPersonalData: false, options: [
    { id: 1, value: "0-1 év" },
    { id: 2, value: "1-5 év" },
    { id: 3, value: "5-10 év" },
    { id: 4, value: "10+ év" },
  ]},
  { id: 17, name: "Hogyan értesült a szolgáltatásról?", type: "select", isPersonalData: false, options: [] },
  { id: 18, name: "Használta-e már a szolgáltatást?", type: "boolean", isPersonalData: false },
  { id: 19, name: "Ajánlaná-e a szolgáltatást?", type: "boolean", isPersonalData: false },
  { id: 20, name: "Eset összefoglalás", type: "text", isPersonalData: false },
  { id: 21, name: "UCMS eset azonosító", type: "text", isPersonalData: false },
  { id: 22, name: "További információ szükséges a klienstől?", type: "boolean", isPersonalData: false },
  { id: 23, name: "Eset státusza", type: "select", isPersonalData: false, options: [] },
  { id: 24, name: "Konzultáció helyszíne", type: "text", isPersonalData: false },
  { id: 25, name: "Konzultáció időtartama", type: "integer", isPersonalData: false },
  { id: 26, name: "Konzultáció típusa", type: "select", isPersonalData: false, options: [] },
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
  const [editingOptionValue, setEditingOptionValue] = useState("");
  
  // Translation dialog
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const [selectedInput, setSelectedInput] = useState<CaseInput | null>(null);
  const [translations, setTranslations] = useState<{ [lang: string]: string }>({});
  const [optionTranslations, setOptionTranslations] = useState<{ [optionId: number]: { [lang: string]: string } }>({});

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
        input.id === editingId ? { 
          ...input, 
          name: editForm.name, 
          type: editForm.type,
          // Initialize options array if switching to select
          options: editForm.type === "select" 
            ? (input.options || []) 
            : undefined
        } : input
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
    
    // Initialize option translations
    if (input.options) {
      const optTrans: { [optionId: number]: { [lang: string]: string } } = {};
      input.options.forEach(opt => {
        optTrans[opt.id] = opt.translations || { hu: opt.value, en: "", de: "" };
      });
      setOptionTranslations(optTrans);
    } else {
      setOptionTranslations({});
    }
    
    setTranslationDialogOpen(true);
  };

  const saveTranslations = () => {
    if (selectedInput) {
      setInputs(inputs.map(input => {
        if (input.id === selectedInput.id) {
          return {
            ...input,
            translations,
            options: input.options?.map(opt => ({
              ...opt,
              translations: optionTranslations[opt.id] || opt.translations
            }))
          };
        }
        return input;
      }));
      setTranslationDialogOpen(false);
      setSelectedInput(null);
      toast.success("Fordítások mentve");
    }
  };

  // Dropdown options management
  const addOption = (inputId: number) => {
    if (!newOptionValue.trim()) return;
    
    setInputs(inputs.map(input => {
      if (input.id === inputId) {
        const newId = input.options?.length ? Math.max(...input.options.map(o => o.id)) + 1 : 1;
        return {
          ...input,
          options: [...(input.options || []), { id: newId, value: newOptionValue.trim() }]
        };
      }
      return input;
    }));
    setNewOptionValue("");
    toast.success("Opció hozzáadva");
  };

  const startEditingOption = (optionId: number, value: string) => {
    setEditingOptionId(optionId);
    setEditingOptionValue(value);
  };

  const saveOptionEdit = (inputId: number, optionId: number) => {
    if (!editingOptionValue.trim()) return;
    
    setInputs(inputs.map(input => {
      if (input.id === inputId) {
        return {
          ...input,
          options: input.options?.map(opt => 
            opt.id === optionId ? { ...opt, value: editingOptionValue.trim() } : opt
          )
        };
      }
      return input;
    }));
    setEditingOptionId(null);
    setEditingOptionValue("");
    toast.success("Opció mentve");
  };

  const deleteOption = (inputId: number, optionId: number) => {
    setInputs(inputs.map(input => {
      if (input.id === inputId) {
        return {
          ...input,
          options: input.options?.filter(opt => opt.id !== optionId)
        };
      }
      return input;
    }));
    toast.success("Opció törölve");
  };

  const getTypeBadge = (type: InputType) => {
    switch (type) {
      case "text":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Szöveg</Badge>;
      case "integer":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Egész szám</Badge>;
      case "double":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Tizedes</Badge>;
      case "date":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Dátum</Badge>;
      case "select":
        return <Badge variant="outline" className="bg-accent text-accent-foreground border-accent">Többválasztós</Badge>;
      case "boolean":
        return <Badge variant="outline" className="bg-secondary text-secondary-foreground border-secondary">Igen/Nem</Badge>;
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

  const hasOptions = (type: InputType) => type === "select";

  return (
    <div>
      <h1 className="text-2xl font-calibri-bold text-foreground mb-2 flex items-center gap-2">
        <ListChecks className="w-6 h-6" />
        Inputok
      </h1>
      <a 
        href="#" 
        className="text-cgp-link hover:text-cgp-link-hover hover:underline text-sm inline-flex items-center gap-1 mb-6"
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
              <TableHead className="w-40">Típus</TableHead>
              <TableHead className="w-40 text-center">3 hónap után törlendő</TableHead>
              <TableHead className="w-32 text-center">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inputs.map((input, index) => (
              <>
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
                        {hasOptions(input.type) && (
                          <button 
                            onClick={() => setExpandedId(expandedId === input.id ? null : input.id)}
                            className="p-0.5 hover:bg-muted rounded"
                          >
                            {expandedId === input.id ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        {input.name}
                        {input.type === "database" && (
                          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        {hasOptions(input.type) && (
                          <span className="text-xs text-muted-foreground">
                            ({input.options?.length || 0} opció)
                          </span>
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
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border shadow-lg z-50">
                          <SelectItem value="text">Szöveg</SelectItem>
                          <SelectItem value="integer">Egész szám</SelectItem>
                          <SelectItem value="double">Tizedes szám</SelectItem>
                          <SelectItem value="date">Dátum</SelectItem>
                          <SelectItem value="select">Többválasztós</SelectItem>
                          <SelectItem value="boolean">Igen/Nem</SelectItem>
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
                
                {/* Expandable options for select/multiple-list */}
                {hasOptions(input.type) && expandedId === input.id && (
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={5} className="py-4">
                      <div className="ml-8 space-y-3">
                        <div className="text-sm font-medium text-foreground mb-2">
                          Legördülő opciók:
                        </div>
                        
                        {/* Existing options */}
                        <div className="space-y-2">
                          {input.options?.map((option, optIndex) => (
                            <div key={option.id} className="flex items-center gap-2 bg-card p-2 rounded-lg border">
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                              <span className="text-xs text-muted-foreground w-6">{optIndex + 1}.</span>
                              
                              {editingOptionId === option.id ? (
                                <>
                                  <Input
                                    value={editingOptionValue}
                                    onChange={(e) => setEditingOptionValue(e.target.value)}
                                    className="flex-1 h-8"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveOptionEdit(input.id, option.id);
                                      if (e.key === "Escape") setEditingOptionId(null);
                                    }}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-xl text-primary"
                                    onClick={() => saveOptionEdit(input.id, option.id)}
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-xl"
                                    onClick={() => setEditingOptionId(null)}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-1 text-sm">{option.value}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-xl"
                                    onClick={() => startEditingOption(option.id, option.value)}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-xl text-destructive hover:text-destructive"
                                    onClick={() => deleteOption(input.id, option.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Add new option */}
                        <div className="flex items-center gap-2 mt-3">
                          <Input
                            placeholder="Új opció hozzáadása..."
                            value={newOptionValue}
                            onChange={(e) => setNewOptionValue(e.target.value)}
                            className="flex-1 max-w-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addOption(input.id);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => addOption(input.id)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Hozzáadás
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fordítások: {selectedInput?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Input name translations */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                Mező neve
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {languages.map((lang) => (
                  <div key={lang.code} className="space-y-1">
                    <Label htmlFor={`name-${lang.code}`} className="text-xs">{lang.name}</Label>
                    <Input
                      id={`name-${lang.code}`}
                      value={translations[lang.code] || ""}
                      onChange={(e) => setTranslations({
                        ...translations,
                        [lang.code]: e.target.value
                      })}
                      placeholder={`${lang.name}...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dropdown options translations */}
            {selectedInput?.options && selectedInput.options.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                  Opciók fordításai ({selectedInput.options.length} db)
                </h3>
                <div className="space-y-4">
                  {selectedInput.options.map((option, index) => (
                    <div key={option.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        {index + 1}. {option.value}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {languages.map((lang) => (
                          <div key={`${option.id}-${lang.code}`} className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{lang.name}</Label>
                            <Input
                              value={optionTranslations[option.id]?.[lang.code] || ""}
                              onChange={(e) => setOptionTranslations({
                                ...optionTranslations,
                                [option.id]: {
                                  ...(optionTranslations[option.id] || {}),
                                  [lang.code]: e.target.value
                                }
                              })}
                              placeholder={`${lang.name}...`}
                              className="h-8 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
