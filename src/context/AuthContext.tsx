import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

// 
type Role = "ADMIN" | "STAFF"
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
}

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  //Rehydrate auth on refresh
useEffect(() => {
  const fetchMe = async () => {
    try {
      const res = await axios.get(BASE_URL + "/auth/me", {
        withCredentials: true,
      });

      console.log("ME response:", res.data);
      setUser(res.data); // ✅ FIX
    } catch (err) {
      console.error("ME error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchMe();
}, []);


  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

