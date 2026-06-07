import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  userId: number;
  name: string;
  role: "CANDIDATE" | "RECRUITER";
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (token: string, name: string, role: string, userId: number) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isRecruiter: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const getUserFromStorage = (): AuthUser | null => {
  const stored = localStorage.getItem("hl_auth");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      localStorage.removeItem("hl_auth");
    }
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getUserFromStorage);

  useEffect(() => {
    // Optionally listen for storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "hl_auth" && e.newValue === null) {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = (token: string, name: string, role: string, userId: number) => {
    const authUser: AuthUser = { token, name, role: role as "CANDIDATE" | "RECRUITER", userId };
    setUser(authUser);
    localStorage.setItem("hl_auth", JSON.stringify(authUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hl_auth");
    localStorage.removeItem("savedJobs");
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isRecruiter: user?.role === "RECRUITER",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
