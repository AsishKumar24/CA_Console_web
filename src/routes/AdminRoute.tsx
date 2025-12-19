// src/routes/AdminRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../api/useAuth";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

//this way signup wont be done by any user he can't even write /signup