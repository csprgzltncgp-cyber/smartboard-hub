import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  Search,
  Users,
  User,
  Headphones,
  Circle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatUser {
  id: string;
  name: string;
  role: "operator" | "expert" | "staff";
  isOnline: boolean;
  lastMessage?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

// Mock users for demo
const mockUsers: ChatUser[] = [
  { id: "1", name: "Kiss Barbara", role: "operator", isOnline: true, lastMessage: "Rendben, köszönöm!", unreadCount: 2 },
  { id: "2", name: "Nagy Anna", role: "operator", isOnline: true, lastMessage: "Az eset továbbítva." },
  { id: "3", name: "Dr. Szabó János", role: "expert", isOnline: false, lastMessage: "Holnap visszahívom." },
  { id: "4", name: "Kovács Péter", role: "staff", isOnline: true, lastMessage: "Megkaptam a dokumentumot." },
  { id: "5", name: "Tóth Éva", role: "staff", isOnline: false, lastMessage: "Jó reggelt!" },
  { id: "6", name: "Dr. Molnár Kata", role: "expert", isOnline: true },
];

// Mock messages for demo
const mockMessages: Message[] = [
  { id: "1", senderId: "1", text: "Szia! Van egy sürgős esetem, tudsz segíteni?", timestamp: new Date(Date.now() - 3600000), isOwn: false },
  { id: "2", senderId: "current", text: "Igen, küldöm az adatokat.", timestamp: new Date(Date.now() - 3500000), isOwn: true },
  { id: "3", senderId: "1", text: "Rendben, köszönöm!", timestamp: new Date(Date.now() - 3400000), isOwn: false },
];

const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "operator" | "expert" | "staff">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="w-6 h-6 text-cgp-teal" />
            Belső Chat
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Users sidebar */}
          <div className="w-80 border-r flex flex-col bg-muted/20">
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Munkatárs keresése..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Role filters */}
            <div className="p-2 flex gap-1 border-b">
              {[
                { id: "all", label: "Mind" },
                { id: "operator", label: "Operátorok" },
                { id: "expert", label: "Szakértők" },
                { id: "staff", label: "Munkatársak" },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setFilterRole(role.id as typeof filterRole)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
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
              <div className="p-2 space-y-1">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full p-3 rounded-xl flex items-start gap-3 transition-colors text-left ${
                        selectedUser?.id === user.id
                          ? "bg-cgp-teal/10 border border-cgp-teal"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-cgp-teal/20 text-cgp-teal">
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <Circle 
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${
                            user.isOnline ? "text-green-500 fill-green-500" : "text-gray-400 fill-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{user.name}</span>
                          {user.unreadCount && (
                            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {user.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <RoleIcon className="w-3 h-3" />
                          <span>{getRoleLabel(user.role)}</span>
                        </div>
                        {user.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {user.lastMessage}
                          </p>
                        )}
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
                <div className="p-4 border-b flex items-center gap-3 bg-background">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-cgp-teal/20 text-cgp-teal">
                      {selectedUser.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedUser.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Circle 
                        className={`w-2 h-2 ${
                          selectedUser.isOnline ? "text-green-500 fill-green-500" : "text-gray-400 fill-gray-400"
                        }`}
                      />
                      {selectedUser.isOnline ? "Online" : "Offline"}
                      <span className="mx-1">•</span>
                      {getRoleLabel(selectedUser.role)}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            message.isOwn
                              ? "bg-cgp-teal text-white rounded-br-none"
                              : "bg-muted rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${message.isOwn ? "text-white/70" : "text-muted-foreground"}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message input */}
                <div className="p-4 border-t bg-background">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Üzenet írása..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button 
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
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Válassz ki egy munkatársat a beszélgetés indításához</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
