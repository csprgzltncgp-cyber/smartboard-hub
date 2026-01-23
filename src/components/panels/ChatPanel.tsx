import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  Search,
  Users,
  User,
  Headphones,
  Circle,
  X,
  Trash2,
  CheckSquare,
  Square
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useAppUsersDb } from "@/hooks/useAppUsersDb";
import { useAppOperatorsDb } from "@/hooks/useAppOperatorsDb";
import { User as UserType } from "@/types/user";

// Import avatar images for fallback/demo
import avatarBarbara from "@/assets/avatars/avatar-barbara.jpg";
import avatarAnna from "@/assets/avatars/avatar-anna.jpg";
import avatarJanos from "@/assets/avatars/avatar-janos.jpg";
import avatarPeter from "@/assets/avatars/avatar-peter.jpg";
import avatarEva from "@/assets/avatars/avatar-eva.jpg";

interface ChatPanelProps {
  onClose: () => void;
}

interface ChatUser {
  id: string;
  name: string;
  role: "operator" | "expert" | "staff";
  isOnline: boolean;
  lastMessage?: string;
  unreadCount?: number;
  avatarUrl?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

// Default avatars for demo users without custom avatar
const defaultAvatars: Record<string, string> = {
  "avatar-barbara": avatarBarbara,
  "avatar-anna": avatarAnna,
  "avatar-janos": avatarJanos,
  "avatar-peter": avatarPeter,
  "avatar-eva": avatarEva,
};

// Build chat users from registered users and operators
const buildChatUsersFromData = (
  currentUserId: string | undefined, 
  users: UserType[], 
  operators: UserType[]
): ChatUser[] => {
  const chatUsers: ChatUser[] = [];
  
  // Add users (as staff by default, could be enhanced with role detection)
  users.forEach(user => {
    // Skip current logged-in user
    if (user.id === currentUserId) return;
    // Only active users
    if (!user.active) return;
    
    chatUsers.push({
      id: `user-${user.id}`,
      name: user.name,
      role: "staff",
      isOnline: Math.random() > 0.5, // Random online status for demo
      avatarUrl: user.avatarUrl,
    });
  });
  
  // Add operators
  operators.forEach(op => {
    // Skip current logged-in user
    if (op.id === currentUserId) return;
    // Only active operators
    if (!op.active) return;
    
    chatUsers.push({
      id: `operator-${op.id}`,
      name: op.name,
      role: "operator",
      isOnline: Math.random() > 0.3, // Operators more likely online
      avatarUrl: op.avatarUrl,
    });
  });
  
  return chatUsers;
};

// Mock messages generator per user - in production this would come from API
const generateMockMessagesForUser = (currentUserId: string, chatPartnerId: string): Message[] => {
  // Different conversations for different logged-in users
  const conversationMap: Record<string, Record<string, Message[]>> = {
    // Admin user's conversations (id: "5")
    "5": {
      "1": [
        { id: "1", senderId: "1", text: "Jó reggelt Admin! 🌞 Sürgős kérésem lenne.", timestamp: new Date(Date.now() - 1800000), isOwn: false },
        { id: "2", senderId: "current", text: "Szia Barbara! Mi a helyzet?", timestamp: new Date(Date.now() - 1700000), isOwn: true },
        { id: "3", senderId: "1", text: "A pénzügyi modulhoz kellene hozzáférés Szabó Máriának.", timestamp: new Date(Date.now() - 1600000), isOwn: false },
        { id: "4", senderId: "current", text: "Rendben, beállítom még ma.", timestamp: new Date(Date.now() - 1500000), isOwn: true },
      ],
      "2": [
        { id: "1", senderId: "2", text: "Admin, láttad a heti riportot?", timestamp: new Date(Date.now() - 86400000), isOwn: false },
        { id: "2", senderId: "current", text: "Igen, minden rendben van vele.", timestamp: new Date(Date.now() - 86300000), isOwn: true },
      ],
      "3": [
        { id: "1", senderId: "3", text: "Tisztelt Admin! A holnapi képzés helyszíne megváltozott.", timestamp: new Date(Date.now() - 172800000), isOwn: false },
        { id: "2", senderId: "current", text: "Köszönöm az értesítést, frissítem a naptárban.", timestamp: new Date(Date.now() - 172700000), isOwn: true },
        { id: "3", senderId: "3", text: "Nagyszerű, köszönöm!", timestamp: new Date(Date.now() - 172600000), isOwn: false },
      ],
      "4": [
        { id: "1", senderId: "4", text: "Megkaptam a rendszerfrissítés dokumentációt.", timestamp: new Date(Date.now() - 259200000), isOwn: false },
      ],
      "5": [
        { id: "1", senderId: "5", text: "🎉 Üdvözöllek az Admin chatben!", timestamp: new Date(Date.now() - 3600000), isOwn: false },
      ],
    },
    // Kiss Barbara's conversations (id: "2")
    "2": {
      "1": [
        { id: "1", senderId: "1", text: "Szia Barbi! Láttad a mai eseteket?", timestamp: new Date(Date.now() - 3600000), isOwn: false },
        { id: "2", senderId: "current", text: "Igen, már foglalkozom velük!", timestamp: new Date(Date.now() - 3500000), isOwn: true },
      ],
      "3": [
        { id: "1", senderId: "3", text: "Barbara, a holnapi workshop részletei?", timestamp: new Date(Date.now() - 172800000), isOwn: false },
        { id: "2", senderId: "current", text: "10 órától a nagy tárgyalóban.", timestamp: new Date(Date.now() - 172700000), isOwn: true },
      ],
    },
  };

  // Default conversation for any other user
  const defaultMessages: Message[] = [
    { id: "1", senderId: chatPartnerId, text: "Szia! Van egy sürgős esetem, tudsz segíteni?", timestamp: new Date(Date.now() - 3600000), isOwn: false },
    { id: "2", senderId: "current", text: "Igen, küldöm az adatokat.", timestamp: new Date(Date.now() - 3500000), isOwn: true },
    { id: "3", senderId: chatPartnerId, text: "Rendben, köszönöm!", timestamp: new Date(Date.now() - 3400000), isOwn: false },
  ];

  return conversationMap[currentUserId]?.[chatPartnerId] || defaultMessages;
};

const ChatPanel = ({ onClose }: ChatPanelProps) => {
  const { currentUser } = useAuth();
  const { users, loading: usersLoading } = useAppUsersDb();
  const { operators, loading: operatorsLoading } = useAppOperatorsDb();
  const currentUserId = currentUser?.id || "guest";
  
  // Build chat users from database (memoized)
  const chatUsers = useMemo(() => {
    if (usersLoading || operatorsLoading) return [];
    return buildChatUsersFromData(currentUserId, users, operators);
  }, [currentUserId, users, operators, usersLoading, operatorsLoading]);
  
  // User-specific localStorage keys
  const getStorageKey = (key: string) => `cgpchat-${currentUserId}-${key}`;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "operator" | "expert" | "staff">("all");
  const [deletedConversations, setDeletedConversations] = useState<string[]>(() => {
    const saved = localStorage.getItem(getStorageKey("deleted-conversations"));
    return saved ? JSON.parse(saved) : [];
  });
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore selected user when chat users are loaded
  useEffect(() => {
    if (chatUsers.length > 0 && !selectedUser) {
      const savedUserId = localStorage.getItem(getStorageKey("selected-user"));
      if (savedUserId) {
        const user = chatUsers.find(u => u.id === savedUserId);
        if (user) {
          setSelectedUser(user);
        }
      }
    }
  }, [chatUsers, selectedUser, getStorageKey]);

  // Load messages when selected user changes (user-specific)
  useEffect(() => {
    if (selectedUser) {
      // Try to load from localStorage first
      const savedMessages = localStorage.getItem(getStorageKey(`messages-${selectedUser.id}`));
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        setMessages(parsed.map((m: Message & { timestamp: string }) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } else {
        // Use mock messages for this user combination
        setMessages(generateMockMessagesForUser(currentUserId, selectedUser.id));
      }
      localStorage.setItem(getStorageKey("selected-user"), selectedUser.id);
    }
  }, [selectedUser, currentUserId]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      localStorage.setItem(getStorageKey(`messages-${selectedUser.id}`), JSON.stringify(messages));
    }
  }, [messages, selectedUser, currentUserId]);

  // Reset state when user changes
  useEffect(() => {
    const savedUserId = localStorage.getItem(getStorageKey("selected-user"));
    if (savedUserId && chatUsers.length > 0) {
      const user = chatUsers.find(u => u.id === savedUserId);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
      setMessages([]);
    }
  }, [currentUserId, chatUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    if (selectedUser) {
      scrollToBottom();
    }
  }, [messages, selectedUser]);

  const filteredUsers = chatUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const notDeleted = !deletedConversations.includes(user.id);
    return matchesSearch && matchesRole && notDeleted;
  });

  const handleDeleteConversation = (userId: string) => {
    // Remove messages from localStorage
    localStorage.removeItem(getStorageKey(`messages-${userId}`));
    
    // Add to deleted conversations list
    const newDeleted = [...deletedConversations, userId];
    setDeletedConversations(newDeleted);
    localStorage.setItem(getStorageKey("deleted-conversations"), JSON.stringify(newDeleted));
    
    // Clear selection if this was the selected user
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
      setMessages([]);
      localStorage.removeItem(getStorageKey("selected-user"));
    }
  };

  const handleDeleteSelected = () => {
    selectedForDelete.forEach(userId => {
      handleDeleteConversation(userId);
    });
    setSelectedForDelete([]);
    setIsSelectMode(false);
    setShowDeleteConfirm(false);
  };

  const toggleSelectForDelete = (userId: string) => {
    setSelectedForDelete(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleExitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedForDelete([]);
  };

  const handleRestoreAllConversations = () => {
    setDeletedConversations([]);
    localStorage.removeItem(getStorageKey("deleted-conversations"));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: "current",
      text: newMessage,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "operator": return Headphones;
      case "expert": return User;
      default: return Users;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "operator": return "Operátor";
      case "expert": return "Szakértő";
      default: return "Munkatárs";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
  };

  const isLoading = usersLoading || operatorsLoading;

  return (
    <div className="bg-background border rounded-xl shadow-lg z-50 overflow-hidden w-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-cgp-teal/5">
        <h3 className="font-calibri-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cgp-teal" />
          CGPchat
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex h-[500px]">
        {/* Users sidebar */}
        <div className="w-72 border-r flex flex-col bg-muted/10">
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Keresés..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>
          </div>

          {/* Role filters + Select mode toggle */}
          <div className="p-1.5 flex flex-wrap gap-1 border-b items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {[
                { id: "all", label: "Mind" },
                { id: "operator", label: "Op." },
                { id: "expert", label: "Szak." },
                { id: "staff", label: "Munk." },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setFilterRole(role.id as typeof filterRole)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    filterRole === role.id
                      ? "bg-cgp-teal text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
            {!isSelectMode ? (
              <button
                onClick={() => setIsSelectMode(true)}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Beszélgetések kijelölése"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleExitSelectMode}
                className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
              >
                Mégse
              </button>
            )}
          </div>

          {/* Select mode action bar */}
          {isSelectMode && (
            <div className="p-1.5 border-b bg-destructive/5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedForDelete.length} kijelölve
              </span>
              <Button
                size="sm"
                variant="destructive"
                className="h-6 text-xs rounded-xl"
                disabled={selectedForDelete.length === 0}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Törlés
              </Button>
            </div>
          )}

          {/* Users list */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Betöltés...
              </div>
            ) : (
              <div className="p-1.5 space-y-1">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const isSelectedForDelete = selectedForDelete.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      className={`w-full p-2 rounded-lg flex items-start gap-2 transition-all text-left ${
                        selectedUser?.id === user.id && !isSelectMode
                          ? "bg-cgp-teal/10 border border-cgp-teal"
                          : isSelectedForDelete
                          ? "bg-destructive/10 border border-destructive/30"
                          : "hover:bg-muted"
                      }`}
                    >
                      {/* Checkbox for select mode */}
                      <div 
                        className={`flex items-center justify-center transition-all duration-200 overflow-hidden ${
                          isSelectMode ? "w-6 opacity-100" : "w-0 opacity-0"
                        }`}
                      >
                        <Checkbox
                          checked={isSelectedForDelete}
                          onCheckedChange={() => toggleSelectForDelete(user.id)}
                          className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                        />
                      </div>
                      
                      <button
                        onClick={() => isSelectMode ? toggleSelectForDelete(user.id) : setSelectedUser(user)}
                        className="flex items-start gap-2 flex-1 min-w-0"
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="bg-cgp-teal/20 text-cgp-teal text-xs">
                              {user.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <Circle 
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                              user.isOnline ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium truncate">{user.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <RoleIcon className="w-3 h-3" />
                            <span>{getRoleLabel(user.role)}</span>
                          </div>
                          {user.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {user.lastMessage}
                            </p>
                          )}
                        </div>
                        {user.unreadCount && user.unreadCount > 0 && (
                          <span className="bg-cgp-teal text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {user.unreadCount}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
                {filteredUsers.length === 0 && !isLoading && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {deletedConversations.length > 0 ? (
                      <div>
                        <p>Nincs megjeleníthető beszélgetés</p>
                        <button 
                          onClick={handleRestoreAllConversations}
                          className="text-cgp-teal hover:underline mt-1"
                        >
                          Visszaállítás
                        </button>
                      </div>
                    ) : (
                      "Nincs találat"
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-2 border-b flex items-center gap-3 bg-muted/30">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} />
                  <AvatarFallback className="bg-cgp-teal/20 text-cgp-teal">
                    {selectedUser.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">{selectedUser.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Circle 
                      className={`w-2 h-2 ${
                        selectedUser.isOnline ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"
                      }`}
                    />
                    {selectedUser.isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.isOwn
                            ? "bg-cgp-teal text-white rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? "text-white/70" : "text-muted-foreground"
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Írj üzenetet..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-cgp-teal hover:bg-cgp-teal/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Válassz egy beszélgetést a bal oldali listából</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Beszélgetések törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd a kijelölt {selectedForDelete.length} beszélgetést?
              Ez a művelet nem vonható vissza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
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

export default ChatPanel;
