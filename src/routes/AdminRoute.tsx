// src/routes/AdminRoute.tsx
import { Navigate, Outlet } from "react-router-dom"; // Trigger reload
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/ui/LoadingScreen";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

//this way signup wont be done by any user he can't even write /signup