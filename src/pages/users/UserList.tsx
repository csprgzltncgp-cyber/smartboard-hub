import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Settings, Trash2, Power, Search } from "lucide-react";
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
import { getUsers, deleteUser, toggleUserActive } from "@/stores/userStore";
import { getSmartboardById } from "@/config/smartboards";
import { User } from "@/types/user";
import { toast } from "sonner";

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(getUsers());
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = (user: User) => {
    toggleUserActive(user.id);
    setUsers(getUsers());
    toast.success(user.active ? "Felhasználó deaktiválva" : "Felhasználó aktiválva");
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setUsers(getUsers());
      toast.success("Felhasználó törölve");
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const getDefaultSmartboard = (user: User): string => {
    const defaultPermission = user.smartboardPermissions.find(p => p.isDefault);
    if (defaultPermission) {
      const sb = getSmartboardById(defaultPermission.smartboardId);
      return sb?.name || "-";
    }
    return "-";
  };

  const getSmartboardCount = (user: User): number => {
    return user.smartboardPermissions.length;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-calibri-bold">Felhasználók</h1>
        <Button 
          onClick={() => navigate("/dashboard/users/new")}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Új felhasználó
        </Button>
      </div>

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

      {/* Users Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Név</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Felhasználónév</TableHead>
              <TableHead>Default SmartBoard</TableHead>
              <TableHead className="text-center">SmartBoard-ok</TableHead>
              <TableHead className="text-center">Státusz</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className={!user.active ? "opacity-50" : ""}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {getDefaultSmartboard(user) !== "-" ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {getDefaultSmartboard(user)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {getSmartboardCount(user) > 0 ? (
                    <Badge variant="secondary">{getSmartboardCount(user)}</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={user.active ? "default" : "secondary"}
                    className={user.active ? "bg-green-500" : "bg-gray-400"}
                  >
                    {user.active ? "Aktív" : "Inaktív"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/dashboard/users/${user.id}/permissions`)}
                      title="Jogosultságok"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(user)}
                      title={user.active ? "Deaktiválás" : "Aktiválás"}
                    >
                      <Power className={`w-4 h-4 ${user.active ? "text-green-500" : "text-gray-400"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(user)}
                      title="Törlés"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
            <AlertDialogTitle>Felhasználó törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd <strong>{userToDelete?.name}</strong> felhasználót?
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

export default UserList;
