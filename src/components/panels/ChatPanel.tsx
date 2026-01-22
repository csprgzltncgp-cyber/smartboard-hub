import { useState, useRef, useEffect } from "react";
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
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Import avatar images
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

// Mock users for demo with avatars
const mockUsers: ChatUser[] = [
  { id: "1", name: "Kiss Barbara", role: "operator", isOnline: true, lastMessage: "Rendben, köszönöm!", unreadCount: 2, avatarUrl: avatarBarbara },
  { id: "2", name: "Nagy Anna", role: "operator", isOnline: true, lastMessage: "Az eset továbbítva.", avatarUrl: avatarAnna },
  { id: "3", name: "Dr. Szabó János", role: "expert", isOnline: false, lastMessage: "Holnap visszahívom.", avatarUrl: avatarJanos },
  { id: "4", name: "Kovács Péter", role: "staff", isOnline: true, lastMessage: "Megkaptam a dokumentumot.", avatarUrl: avatarPeter },
  { id: "5", name: "Tóth Éva", role: "staff", isOnline: false, lastMessage: "Jó reggelt!", avatarUrl: avatarEva },
];

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
  const currentUserId = currentUser?.id || "guest";
  
  // User-specific localStorage keys
  const getStorageKey = (key: string) => `cgpchat-${currentUserId}-${key}`;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(() => {
    // Restore selected user from localStorage (user-specific)
    const savedUserId = localStorage.getItem(getStorageKey("selected-user"));
    if (savedUserId) {
      return mockUsers.find(u => u.id === savedUserId) || null;
    }
    return null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "operator" | "expert" | "staff">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (savedUserId) {
      const user = mockUsers.find(u => u.id === savedUserId);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
      setMessages([]);
    }
  }, [currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    if (selectedUser) {
      scrollToBottom();
    }
  }, [messages, selectedUser]);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

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

          {/* Role filters */}
          <div className="p-1.5 flex flex-wrap gap-1 border-b">
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

          {/* Users list */}
          <ScrollArea className="flex-1">
            <div className="p-1.5 space-y-1">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-2 rounded-lg flex items-start gap-2 transition-colors text-left ${
                      selectedUser?.id === user.id
                        ? "bg-cgp-teal/10 border border-cgp-teal"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="bg-cgp-teal/20 text-cgp-teal text-xs">
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Circle 
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${
                          user.isOnline ? "text-green-500 fill-green-500" : "text-gray-400 fill-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        {user.unreadCount && (
                          <span className="bg-destructive text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                            {user.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <RoleIcon className="w-2.5 h-2.5" />
                        <span>{getRoleLabel(user.role)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div className="p-3 border-b flex items-center gap-2 bg-background">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} />
                  <AvatarFallback className="bg-cgp-teal/20 text-cgp-teal text-xs">
                    {selectedUser.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-medium">{selectedUser.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Circle 
                      className={`w-1.5 h-1.5 ${
                        selectedUser.isOnline ? "text-green-500 fill-green-500" : "text-gray-400 fill-gray-400"
                      }`}
                    />
                    {selectedUser.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 ${
                          message.isOwn
                            ? "bg-cgp-teal text-white rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-0.5 ${message.isOwn ? "text-white/70" : "text-muted-foreground"}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message input */}
              <div className="p-3 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder="Üzenet..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 h-9"
                  />
                  <Button 
                    size="sm"
                    onClick={handleSendMessage}
                    className="rounded-xl bg-cgp-teal hover:bg-cgp-teal/90"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Válassz munkatársat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
