import { createContext, useContext, useEffect, useState } from "react";
import Favorites from "../services/favorites";
import { socket } from "../services/socket";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]); // book IDs
  const { user } = useAuth();

  async function loadFavorites() {
    if (!user) {
      setFavorites([]);
      return;
    }
    const data = await Favorites.getFavorites();
    setFavorites(data.map((f) => f.bookid));
  }

  // initial load & when user changes
  useEffect(() => {
    loadFavorites();
  }, [user]);

  // ❤️ TOGGLE
  async function toggleFavorite(bookId) {
    if (favorites.includes(bookId)) {
      await Favorites.remove(bookId);
      setFavorites((prev) => prev.filter((id) => id !== bookId));
    } else {
      await Favorites.add(bookId);
      setFavorites((prev) => [...prev, bookId]);
    }
  }

  // listen to server-side favorites changes (other tabs/devices)
  useEffect(() => {
    function handleFavoritesChanged(data) {
      if (!user || data?.user_id !== user.id) return;
      // re-sync from server
      loadFavorites();
    }

    socket.on("favorites_changed", handleFavoritesChanged);

    return () => {
      socket.off("favorites_changed", handleFavoritesChanged);
    };
  }, [user]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
