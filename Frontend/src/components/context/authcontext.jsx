import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../services/socket";

const APIKEY = import.meta.env.VITE_API_KEY;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/auth/me", {
        withCredentials: true,
        headers: { apiKey:APIKEY},
      });
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // listen for profile updates
  useEffect(() => {
    function handleProfileUpdated(data) {
      // if event for this user or unknown user, just refetch
      if (!user || !data?.user_id || data.user_id === user.id) {
        fetchUser({ silent: true });
      }
    }

    socket.on("profile_updated", handleProfileUpdated);

    return () => {
      socket.off("profile_updated", handleProfileUpdated);
    };
  }, [user]); // re-subscribe if user changes

  useEffect(() => {
    function handleUsersChanged(payload) {
      if (!user?.id || !payload?.userId) return;
      if (String(payload.userId) !== String(user.id)) return;
      fetchUser({ silent: true });
    }

    socket.on("users_changed", handleUsersChanged);
    return () => {
      socket.off("users_changed", handleUsersChanged);
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        loading,
        isAdmin: user?.role === "admin",
        isBlocked:
          user?.is_blocked === true ||
          user?.is_blocked === 1 ||
          user?.is_blocked === "1",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
