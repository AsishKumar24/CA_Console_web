import { useState, useEffect, ReactNode } from "react"; // Trigger reload
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { AuthContext, User } from "./AuthContext";
import { useMinimumLoadingTime } from "../hooks/useMinimumLoadingTime";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [actualLoading, setActualLoading] = useState(true);
  
  // Use the hook to ensure minimum 2s loading time to showcase shader animation
  const loading = useMinimumLoadingTime(actualLoading, 2000);

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
      setActualLoading(false);
    }
  };

  const refreshUser = async () => {
    setActualLoading(true);
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
