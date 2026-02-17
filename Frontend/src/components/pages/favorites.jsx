import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Favorites from "../services/favorites";
import Books from "../services/books";
import BookItem from "./BookItem";
import "../csspages/favorites.css";
import { useAuth } from "../context/authcontext";
import { socket } from "../services/socket";

export default function FavoritesPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isBlocked, user } = useAuth();

  const loadFavorites = useCallback(async () => { // טוען את ספרי המועדפים של המשתמש
    setLoading(true);
    try {
      const favs = await Favorites.getFavorites();
      const bookIds = favs.map((f) => f.bookid); 

      if (bookIds.length === 0) {
        setBooks([]);
        return;
      }

      const booksData = await Promise.all( // מקבל את פרטי כל ספר לפי ה-IDs
        bookIds.map((id) => Books.getBookById(id))
      );
      setBooks(booksData);
    } catch (err) {
      console.error(err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // live updates: favorites or book data changed
  useEffect(() => {
    function handleFavoritesChanged(data) {
      if (!user || data?.user_id !== user.id) return;
      loadFavorites();
    }

    function handleBooksChanged(payload) {
      if (!payload?.bookId) return;

      setBooks(prev =>
        prev.map(b =>
          b.id === payload.bookId
            ? { ...b, quantity: payload.quantity }
            : b
        )
      );
    }


    socket.on("favorites_changed", handleFavoritesChanged);
    socket.on("books_changed", handleBooksChanged);

    return () => {
      socket.off("favorites_changed", handleFavoritesChanged);
      socket.off("books_changed", handleBooksChanged);
    };
  }, [user, loadFavorites]);

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="favorites-loading">
          <div className="loading-spinner"></div>
          <p>טוען מועדפים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-back">
        <button onClick={() => navigate(-1)}>← חזרה</button>
      </div>

      {isBlocked && (
        <div className="blocked-warning">
          ⚠️ החשבון שלך חסום — ניתן לצפות בלבד, לא ניתן לבצע שינויים.
        </div>
      )}

      <div className="books-grid">
        {books.length === 0 ? (
          <div className="favorites-empty">
            <div className="empty-icon">📚</div>
            <h2>אין ספרים מועדפים</h2>
            <p>
              עדיין לא הוספת ספרים למועדפים שלך.
              <br />
              התחילי לגלות ספרים מדהימים!
            </p>
            <a href="/book" className="browse-btn">
              גלה/י ספרים
            </a>
          </div>
        ) : (
          books.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              setBooks={setBooks}
              readOnly={isBlocked}
            />
          ))
        )}
      </div>
    </div>
  );
}
