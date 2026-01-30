import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Pencil, Trash2, Share2, X, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  color: NoteColor;
  position: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
}

type NoteColor = "teal" | "green" | "orange" | "purple" | "light";

const noteColors: Record<NoteColor, { bg: string; border: string; shadow: string; colorDot: string }> = {
  teal: { 
    bg: "bg-cgp-teal-light/20", 
    border: "border-cgp-teal-light", 
    shadow: "shadow-cgp-teal-light/30",
    colorDot: "bg-cgp-teal-light"
  },
  green: { 
    bg: "bg-cgp-badge-new/20", 
    border: "border-cgp-badge-new", 
    shadow: "shadow-cgp-badge-new/30",
    colorDot: "bg-cgp-badge-new"
  },
  orange: { 
    bg: "bg-cgp-badge-lastday/20", 
    border: "border-cgp-badge-lastday", 
    shadow: "shadow-cgp-badge-lastday/30",
    colorDot: "bg-cgp-badge-lastday"
  },
  purple: { 
    bg: "bg-cgp-task-completed-purple/20", 
    border: "border-cgp-task-completed-purple", 
    shadow: "shadow-cgp-task-completed-purple/30",
    colorDot: "bg-cgp-task-completed-purple"
  },
  light: { 
    bg: "bg-cgp-form-bg", 
    border: "border-muted-foreground/30", 
    shadow: "shadow-muted/50",
    colorDot: "bg-muted-foreground/50"
  },
};

interface NotesTabContentProps {
  companyId: string;
  entityId?: string;
  entityName?: string;
  onAddNoteRef?: (fn: () => void) => void;
}

export const NotesTabContent = ({ companyId, entityId, entityName, onAddNoteRef }: NotesTabContentProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareNoteId, setShareNoteId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const addNote = useCallback(() => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: "",
      color: (["teal", "green", "orange", "purple", "light"] as NoteColor[])[Math.floor(Math.random() * 5)],
      position: { 
        x: 20 + (notes.length % 4) * 220, 
        y: 20 + Math.floor(notes.length / 4) * 200 
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([...notes, newNote]);
    setEditingId(newNote.id);
    setEditContent("");
    toast.success("Új feljegyzés létrehozva");
  }, [notes]);

  // Expose addNote to parent
  useEffect(() => {
    if (onAddNoteRef) {
      onAddNoteRef(addNote);
    }
  }, [onAddNoteRef, addNote]);

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEditing = () => {
    if (editingId) {
      setNotes(notes.map(note =>
        note.id === editingId
          ? { ...note, content: editContent, updatedAt: new Date() }
          : note
      ));
      setEditingId(null);
      toast.success("Feljegyzés mentve");
    }
  };

  const cancelEditing = () => {
    // If new note is empty, remove it
    const note = notes.find(n => n.id === editingId);
    if (note && note.content === "" && editContent === "") {
      setNotes(notes.filter(n => n.id !== editingId));
    }
    setEditingId(null);
  };

  const openDeleteDialog = (note: Note) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      setNotes(notes.filter(n => n.id !== noteToDelete.id));
      toast.success("Feljegyzés törölve");
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const changeColor = (noteId: string, color: NoteColor) => {
    setNotes(notes.map(note =>
      note.id === noteId ? { ...note, color } : note
    ));
  };

  const handleShare = (noteId: string) => {
    if (!shareEmail.trim()) {
      toast.error("Add meg az email címet");
      return;
    }
    // TODO: Implement actual sharing via backend
    toast.success(`Feljegyzés megosztva: ${shareEmail}`);
    setShareEmail("");
    setShareNoteId(null);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || editingId === noteId) return;
    
    e.preventDefault();
    dragRef.current = {
      id: noteId,
      startX: e.clientX,
      startY: e.clientY,
      origX: note.position.x,
      origY: note.position.y,
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !containerRef.current) return;
    
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(containerRect.width - 200, dragRef.current.origX + dx));
    const newY = Math.max(0, dragRef.current.origY + dy);
    
    setNotes(prev => prev.map(note =>
      note.id === dragRef.current?.id
        ? { ...note, position: { x: newX, y: newY } }
        : note
    ));
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Céggel kapcsolatos jegyzetek, fontos információk rögzítése post-it stílusban.
      </p>

      {notes.length === 0 ? (
        <div className="bg-muted/30 border rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            Még nincsenek feljegyzések. Kattints az "Új feljegyzés hozzáadása" gombra!
          </p>
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="relative bg-muted/20 border rounded-xl min-h-[500px] overflow-hidden"
          style={{ minHeight: Math.max(500, ...notes.map(n => n.position.y + 220)) }}
        >
          {notes.map((note) => {
            const colors = noteColors[note.color];
            const isEditing = editingId === note.id;
            
            return (
              <div
                key={note.id}
                className={cn(
                  "absolute w-52 min-h-[180px] rounded-lg border-2 shadow-lg transition-shadow",
                  colors.bg,
                  colors.border,
                  colors.shadow,
                  isEditing ? "z-20 shadow-xl" : "z-10 hover:shadow-xl hover:z-15",
                  !isEditing && "cursor-grab active:cursor-grabbing"
                )}
                style={{
                  left: note.position.x,
                  top: note.position.y,
                }}
              >
                {/* Header with drag handle and actions */}
                <div 
                  className="flex items-center justify-between px-2 py-1.5 border-b border-current/10"
                  onMouseDown={(e) => handleMouseDown(e, note.id)}
                >
                  <div className="flex items-center gap-1">
                    <GripVertical className="w-4 h-4 text-current/40" />
                    {/* Color picker */}
                    <div className="flex gap-0.5">
                      {(Object.keys(noteColors) as NoteColor[]).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeColor(note.id, color);
                          }}
                          className={cn(
                            "w-4 h-4 rounded-full border-2 border-white/50 transition-transform hover:scale-110",
                            noteColors[color].colorDot,
                            note.color === color && "ring-2 ring-foreground/30 ring-offset-1"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-0.5">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={saveEditing}
                          className="p-1 rounded hover:bg-current/10 text-cgp-badge-new"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="p-1 rounded hover:bg-current/10 text-current/60"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(note)}
                          className="p-1 rounded hover:bg-current/10 text-current/60"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <Popover open={shareNoteId === note.id} onOpenChange={(open) => setShareNoteId(open ? note.id : null)}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-current/10 text-current/60"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3" align="end">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Megosztás emailben</p>
                              <Input
                                type="email"
                                placeholder="email@example.com"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                className="h-8"
                              />
                              <Button
                                type="button"
                                size="sm"
                                className="w-full rounded-xl"
                                onClick={() => handleShare(note.id)}
                              >
                                Megosztás
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(note)}
                          className="p-1 rounded hover:bg-current/10 text-cgp-error"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-3">
                  {isEditing ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Írd ide a jegyzetet..."
                      className="min-h-[120px] bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-sm"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words min-h-[120px]">
                      {note.content || <span className="text-current/40 italic">Üres jegyzet</span>}
                    </p>
                  )}
                </div>
                
                {/* Footer with date */}
                <div className="px-3 pb-2 text-xs text-current/50">
                  {note.updatedAt.toLocaleDateString("hu-HU", { 
                    month: "short", 
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Feljegyzés törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd ezt a feljegyzést? Ez a művelet nem vonható vissza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" className="rounded-xl">Mégse</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
