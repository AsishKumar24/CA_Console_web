import { Navigate, Outlet } from "react-router-dom"; // Trigger reload
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { LoadingScreen } from "../components/ui/LoadingScreen";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  // 🔍 Log only when auth check is done
  useEffect(() => {
    if (!loading) {
      console.log("ProtectedLayout user:", user);
    }
  }, [loading, user]);

  if (loading) return <LoadingScreen />;

  if (!user) {
    console.log("User NOT authenticated, redirecting...");
    return <Navigate to="/signin" replace />;
  }

  console.log("User authenticated, rendering app");

  return <Outlet />;
}
