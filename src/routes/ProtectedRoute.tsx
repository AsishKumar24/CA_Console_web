import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../api/useAuth";
import { useEffect } from "react";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  // 🔍 Log only when auth check is done
  useEffect(() => {
    if (!loading) {
      console.log("ProtectedLayout user:", user);
    }
  }, [loading, user]);

  if (loading) return <p>Loading...</p>;

  if (!user) {
    console.log("User NOT authenticated, redirecting...");
    return <Navigate to="/signin" replace />;
  }

  console.log("User authenticated, rendering app");

  return <Outlet />;
}
