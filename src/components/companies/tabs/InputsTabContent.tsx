import { useState } from "react";
import { Plus, Globe, Database, Lock, Pencil, Trash2, Save, X, ChevronDown, ChevronRight } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

type InputType = "text" | "integer" | "double" | "date" | "select" | "boolean";

interface DropdownOption {
  id: number;
  value: string;
  translations?: { [lang: string]: string };
}

interface CompanyInput {
  id: number;
  name: string;
  type: InputType;
  isPersonalData: boolean;
  translations?: { [lang: string]: string };
  options?: DropdownOption[];
}

const languages = [
  { code: "hu", name: "Magyar" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
];

interface InputsTabContentProps {
  companyId: string;
}

export const InputsTabContent = ({ companyId }: InputsTabContentProps) => {
  const [inputs, setInputs] = useState<CompanyInput[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; type: InputType }>({ name: "", type: "text" });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
  const [editingOptionValue, setEditingOptionValue] = useState("");
  
  // Translation dialog
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const [selectedInput, setSelectedInput] = useState<CompanyInput | null>(null);
  const [translations, setTranslations] = useState<{ [lang: string]: string }>({});
  const [optionTranslations, setOptionTranslations] = useState<{ [optionId: number]: { [lang: string]: string } }>({});
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inputToDelete, setInputToDelete] = useState<CompanyInput | null>(null);

  const handlePersonalDataToggle = (id: number, checked: boolean) => {
    setInputs(inputs.map(input => 
      input.id === id ? { ...input, isPersonalData: checked } : input
    ));
    toast.success("Beállítás mentve");
  };

  const startEditing = (input: CompanyInput) => {
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
          options: editForm.type === "select" 
            ? (input.options || []) 
            : undefined
        } : input
      ));
      setEditingId(null);
      toast.success("Input mentve");
    }
  };

  const openDeleteDialog = (input: CompanyInput) => {
    setInputToDelete(input);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteInput = () => {
    if (inputToDelete) {
      setInputs(inputs.filter(input => input.id !== inputToDelete.id));
      toast.success("Input törölve");
      setDeleteDialogOpen(false);
      setInputToDelete(null);
    }
  };

  const openTranslationDialog = (input: CompanyInput) => {
    setSelectedInput(input);
    setTranslations(input.translations || { hu: input.name, en: "", de: "" });
    
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
    }
  };

  const addNewInput = () => {
    const newId = inputs.length > 0 ? Math.max(...inputs.map(i => i.id)) + 1 : 1;
    const newInput: CompanyInput = {
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
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Itt hozhatsz létre és szerkeszthetsz cég-specifikus egyedi inputokat.
      </p>
      
      <Button
        onClick={addNewInput}
        className="rounded-xl"
      >
        <Plus className="w-4 h-4 mr-2" />
        Új input hozzáadása
      </Button>

      {inputs.length === 0 ? (
        <div className="bg-muted/30 border rounded-lg p-6">
          <p className="text-center text-muted-foreground">
            Még nincsenek cég-specifikus inputok. Kattints az "Új input létrehozása" gombra!
          </p>
        </div>
      ) : (
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
                  <TableRow key={input.id}>
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
                              onClick={() => startEditing(input)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => openTranslationDialog(input)}
                            >
                              <Globe className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(input)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded options for select type */}
                  {hasOptions(input.type) && expandedId === input.id && (
                    <TableRow key={`${input.id}-options`}>
                      <TableCell colSpan={5} className="bg-muted/20 p-4">
                        <div className="space-y-3 pl-8">
                          <Label className="text-sm font-medium">Választható opciók:</Label>
                          <div className="space-y-2">
                            {input.options?.map((option) => (
                              <div key={option.id} className="flex items-center gap-2">
                                {editingOptionId === option.id ? (
                                  <>
                                    <Input
                                      value={editingOptionValue}
                                      onChange={(e) => setEditingOptionValue(e.target.value)}
                                      className="max-w-xs h-8"
                                      autoFocus
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-primary"
                                      onClick={() => saveOptionEdit(input.id, option.id)}
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => setEditingOptionId(null)}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm">{option.value}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => startEditingOption(option.id, option.value)}
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                      onClick={() => deleteOption(input.id, option.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Input
                              placeholder="Új opció..."
                              value={newOptionValue}
                              onChange={(e) => setNewOptionValue(e.target.value)}
                              className="max-w-xs h-8"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  addOption(input.id);
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-xl"
                              onClick={() => addOption(input.id)}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
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
      )}

      {/* Translation Dialog */}
      <Dialog open={translationDialogOpen} onOpenChange={setTranslationDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fordítások szerkesztése</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="font-medium">Input név fordítása:</Label>
              {languages.map((lang) => (
                <div key={lang.code} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-muted-foreground">{lang.name}:</span>
                  <Input
                    value={translations[lang.code] || ""}
                    onChange={(e) => setTranslations({ ...translations, [lang.code]: e.target.value })}
                    placeholder={selectedInput?.name}
                  />
                </div>
              ))}
            </div>
            
            {selectedInput?.type === "select" && selectedInput.options && selectedInput.options.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="font-medium">Opciók fordítása:</Label>
                {selectedInput.options.map((option) => (
                  <div key={option.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">{option.value}</span>
                    {languages.map((lang) => (
                      <div key={`${option.id}-${lang.code}`} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-muted-foreground">{lang.name}:</span>
                        <Input
                          className="h-8 text-sm"
                          value={optionTranslations[option.id]?.[lang.code] || ""}
                          onChange={(e) => setOptionTranslations({
                            ...optionTranslations,
                            [option.id]: {
                              ...(optionTranslations[option.id] || {}),
                              [lang.code]: e.target.value
                            }
                          })}
                          placeholder={option.value}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setTranslationDialogOpen(false)}>
              Mégse
            </Button>
            <Button className="rounded-xl" onClick={saveTranslations}>
              Mentés
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Input törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd a(z) "{inputToDelete?.name}" inputot? Ez a művelet nem vonható vissza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Mégse</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteInput}
            >
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
