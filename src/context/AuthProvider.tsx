import { useState, useEffect, ReactNode } from "react"; // Trigger reload
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { AuthContext, User } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/me`, {
        withCredentials: true,
      });
      setUser(res.data);
    } catch (err) {
      console.error("ME error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    await fetchMe();
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
