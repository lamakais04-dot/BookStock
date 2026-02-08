import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  // בזמן בדיקת התחברות – לא מציירים כלום
  if (loading) return null;

  // אם המשתמש מחובר → מעיפים אותו מה-login/signup
  if (user) {
    return <Navigate to="/" replace />;
  }

  // אם לא מחובר → מותר להיכנס
  return children;
}
