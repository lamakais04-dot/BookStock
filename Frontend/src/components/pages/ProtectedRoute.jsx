import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Guest → login only
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User trying to open admin page
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
