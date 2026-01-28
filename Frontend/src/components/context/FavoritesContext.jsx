import { createContext, useContext, useEffect, useState } from "react";
import Favorites from "../services/favorites";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]); // book IDs

  // טעינה ראשונית
  useEffect(() => {
    async function loadFavorites() {
      const data = await Favorites.getFavorites();
      setFavorites(data.map(f => f.bookid));
    }
    loadFavorites();
  }, []);

  // ❤️ TOGGLE
  async function toggleFavorite(bookId) {
    if (favorites.includes(bookId)) {
      await Favorites.remove(bookId);
      setFavorites(prev => prev.filter(id => id !== bookId));
    } else {
      await Favorites.add(bookId);
      setFavorites(prev => [...prev, bookId]);
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
