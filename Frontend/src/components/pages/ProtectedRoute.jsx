import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  blockAdmin = false
}) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Guest
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User trying admin page
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Admin trying user-only page
  if (blockAdmin && user.role === "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
