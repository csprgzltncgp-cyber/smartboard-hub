import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Trash2, Power, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { useAppOperatorsDb } from "@/hooks/useAppOperatorsDb";
import { User } from "@/types/user";
import { toast } from "sonner";

const OperatorList = () => {
  const navigate = useNavigate();
  const { operators, loading, toggleOperatorActive, deleteOperator } = useAppOperatorsDb();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState<User | null>(null);

  const filteredOperators = operators.filter(operator => 
    operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = async (operator: User) => {
    await toggleOperatorActive(operator.id);
    toast.success(operator.active ? "Operátor deaktiválva" : "Operátor aktiválva");
  };

  const handleDeleteClick = (operator: User) => {
    setOperatorToDelete(operator);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (operatorToDelete) {
      await deleteOperator(operatorToDelete.id);
      toast.success("Operátor törölve");
    }
    setDeleteDialogOpen(false);
    setOperatorToDelete(null);
  };

  const getEnabledMenuCount = (operator: User): number => {
    const operatorPermission = operator.smartboardPermissions.find(
      p => p.smartboardId === "operator"
    );
    return operatorPermission?.enabledMenuItems.length || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-3xl font-calibri-bold mb-2">Operátorok listája</h1>
      
      {/* Create New Link - Simple underlined blue link (#007bff) */}
      <a 
        href="#" 
        className="text-cgp-link hover:text-cgp-link-hover hover:underline mb-6 block"
        onClick={(e) => {
          e.preventDefault();
          navigate("/dashboard/settings/operators/new");
        }}
      >
        Új operátor hozzáadása
      </a>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Keresés név, email vagy felhasználónév alapján..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Operators Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Név</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Felhasználónév</TableHead>
              <TableHead className="text-center">Engedélyezett menük</TableHead>
              <TableHead className="text-center">Státusz</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOperators.map((operator) => (
              <TableRow key={operator.id} className={!operator.active ? "opacity-50" : ""}>
                <TableCell className="font-medium">{operator.name}</TableCell>
                <TableCell>{operator.email}</TableCell>
                <TableCell>{operator.username}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {getEnabledMenuCount(operator)} / 6
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={operator.active ? "default" : "secondary"}
                    className={operator.active ? "bg-green-500" : "bg-gray-400"}
                  >
                    {operator.active ? "Aktív" : "Inaktív"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/dashboard/settings/operators/${operator.id}/permissions`)}
                      title="Jogosultságok"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(operator)}
                      title={operator.active ? "Deaktiválás" : "Aktiválás"}
                    >
                      <Power className={`w-4 h-4 ${operator.active ? "text-green-500" : "text-gray-400"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(operator)}
                      title="Törlés"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredOperators.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nincs találat
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Operátor törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd <strong>{operatorToDelete?.name}</strong> operátort?
              Ez a művelet nem vonható vissza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OperatorList;
