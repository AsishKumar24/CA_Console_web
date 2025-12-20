import { createContext, useEffect, useState, ReactNode, useContext } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

type Role = "ADMIN" | "STAFF";

interface User {
  id: string;
  firstName: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data from /auth/me
  const fetchMe = async () => {
    try {
      const res = await axios.get(BASE_URL + "/auth/me", {
        withCredentials: true,
      });

      console.log("ME response:", res.data);
      setUser(res.data);
    } catch (err) {
      console.error("ME error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Public function to refresh user (can be called after login)
  const refreshUser = async () => {
    setLoading(true);
    await fetchMe();
  };

  // Rehydrate auth on initial mount
  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { AuthProvider, AuthContext, useAuth };
export type { User, Role };
