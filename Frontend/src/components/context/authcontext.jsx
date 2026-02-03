import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8000/api/auth/me",
        {
          withCredentials: true,
          headers: { apiKey: "123456789apikeysecure" }
        }
      );

      // res.data includes: role + is_blocked (from backend)
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        loading,
        isAdmin: user?.role === "admin",
        isBlocked: user?.is_blocked === true
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
