import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  currentUser: User | null;
  login: (username: string) => Promise<User | null>;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map database row to User type
const mapDbRowToUser = (row: any): User => {
  const perms = row.smartboard_permissions as any;
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    username: row.username,
    phone: row.phone || '',
    countryIds: perms?.countryIds || ['hu'],
    languageId: row.language || 'hu',
    avatarUrl: row.avatar_url || '',
    active: perms?.active !== false,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    smartboardPermissions: perms?.permissions || [],
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from database on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedUserId = localStorage.getItem("currentUserId");
      const savedUserType = localStorage.getItem("currentUserType");
      
      console.log("[Auth] init", { savedUserId, savedUserType });
      
      if (!savedUserId || !savedUserType) {
        setIsLoading(false);
        return;
      }

      try {
        const table = savedUserType === "operator" ? "app_operators" : "app_users";
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("id", savedUserId)
          .single();

        if (error || !data) {
          // Try the other table as fallback
          const fallbackTable = savedUserType === "operator" ? "app_users" : "app_operators";
          const { data: fallbackData, error: fallbackError } = await supabase
            .from(fallbackTable)
            .select("*")
            .eq("id", savedUserId)
            .single();

          if (fallbackError || !fallbackData) {
            console.log("[Auth] User not found in database");
            localStorage.removeItem("currentUserId");
            localStorage.removeItem("currentUserType");
          } else {
            setCurrentUser(mapDbRowToUser(fallbackData));
          }
        } else {
          setCurrentUser(mapDbRowToUser(data));
        }
      } catch (e) {
        console.error("[Auth] Failed to load user:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (username: string): Promise<User | null> => {
    try {
      // Search in users first
      const { data: userData, error: userError } = await supabase
        .from("app_users")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (userData && !userError) {
        const user = mapDbRowToUser(userData);
        if (user.active) {
          setCurrentUser(user);
          localStorage.setItem("currentUserId", user.id);
          localStorage.setItem("currentUserType", "user");
          console.log("[Auth] login success", { username: user.username, userType: "user", userId: user.id });
          return user;
        }
      }

      // Search in operators
      const { data: operatorData, error: operatorError } = await supabase
        .from("app_operators")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (operatorData && !operatorError) {
        const operator = mapDbRowToUser(operatorData);
        if (operator.active) {
          setCurrentUser(operator);
          localStorage.setItem("currentUserId", operator.id);
          localStorage.setItem("currentUserType", "operator");
          console.log("[Auth] login success", { username: operator.username, userType: "operator", userId: operator.id });
          return operator;
        }
      }

      return null;
    } catch (e) {
      console.error("[Auth] Login failed:", e);
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUserType");
    console.log("[Auth] logout");
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const savedUserId = localStorage.getItem("currentUserId");
    const savedUserType = localStorage.getItem("currentUserType");
    
    if (!savedUserId || !savedUserType) return;

    try {
      const table = savedUserType === "operator" ? "app_operators" : "app_users";
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", savedUserId)
        .single();

      if (!error && data) {
        const updatedUser = mapDbRowToUser(data);
        setCurrentUser(updatedUser);
        console.log("[Auth] refreshed user", { name: updatedUser.name });
      }
    } catch (e) {
      console.error("[Auth] Failed to refresh user:", e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      refreshCurrentUser,
      isAuthenticated: currentUser !== null,
      isLoading,
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
