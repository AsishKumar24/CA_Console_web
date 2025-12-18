import { Navigate } from "react-router";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: ReactNode;
}

export default function AdminRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
