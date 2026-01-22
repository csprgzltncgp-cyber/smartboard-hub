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
    console.log("[Auth] init", { savedUserId, savedUserType });
    if (savedUserId && savedUserType) {
      // Primary lookup based on the stored type
      const primaryList = savedUserType === "operator" ? getOperators() : getUsers();
      const primaryMatch = primaryList.find(u => u.id === savedUserId) || null;
      if (primaryMatch) return primaryMatch;

      // Fallback: if the stored type is stale/wrong, try the other list too
      const fallbackList = savedUserType === "operator" ? getUsers() : getOperators();
      return fallbackList.find(u => u.id === savedUserId) || null;
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
      console.log("[Auth] login success", { username: foundUser.username, userType: "user", userId: foundUser.id });
      return foundUser;
    }

    // Search in operators
    const operators = getOperators();
    foundUser = operators.find(u => u.username === username && u.active);
    
    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem("currentUserId", foundUser.id);
      localStorage.setItem("currentUserType", "operator");
      console.log("[Auth] login success", { username: foundUser.username, userType: "operator", userId: foundUser.id });
      return foundUser;
    }

    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUserType");
    console.log("[Auth] logout");
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
