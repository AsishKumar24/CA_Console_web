import { createContext, useContext } from "react";

export type Role = "ADMIN" | "STAFF";

export interface User {
  id: string;
  firstName: string;
  email: string;
  role: Role;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
