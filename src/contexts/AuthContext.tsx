import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types/user";
import { getUsers } from "@/stores/userStore";
import { getOperators } from "@/stores/operatorStore";

interface AuthContextType {
  currentUser: User | null;
  login: (username: string) => User | null;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Check localStorage for persisted user
    const savedUserId = localStorage.getItem("currentUserId");
    const savedUserType = localStorage.getItem("currentUserType");
    if (savedUserId && savedUserType) {
      const users = savedUserType === "operator" ? getOperators() : getUsers();
      return users.find(u => u.id === savedUserId) || null;
    }
    return null;
  });

  const login = (username: string): User | null => {
    // Search in users first
    const users = getUsers();
    let foundUser = users.find(u => u.username === username && u.active);
    
    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem("currentUserId", foundUser.id);
      localStorage.setItem("currentUserType", "user");
      return foundUser;
    }

    // Search in operators
    const operators = getOperators();
    foundUser = operators.find(u => u.username === username && u.active);
    
    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem("currentUserId", foundUser.id);
      localStorage.setItem("currentUserType", "operator");
      return foundUser;
    }

    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUserType");
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      isAuthenticated: currentUser !== null,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
