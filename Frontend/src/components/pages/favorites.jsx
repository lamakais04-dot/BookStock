import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Favorites from "../services/favorites";
import Books from "../services/books";
import BookItem from "./BookItem";
import "../csspages/favorites.css";

export default function FavoritesPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFavorites() {
      try {
        const favs = await Favorites.getFavorites();
        const bookIds = favs.map(f => f.bookid);

        if (bookIds.length === 0) {
          setBooks([]);
          return;
        }

        const booksData = await Promise.all(
          bookIds.map(id => Books.getBookById(id))
        );

        setBooks(booksData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

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
      {/* 🔙 כפתור חזרה */}
      <div className="favorites-back">
        <button onClick={() => navigate(-1)}>
          ← חזרה
        </button>
      </div>

      <div className="books-grid">
        {books.length === 0 ? (
          <div className="favorites-empty">
            <div className="empty-icon">📚</div>
            <h2>אין ספרים מועדפים</h2>
            <p>עדיין לא הוספת ספרים למועדפים שלך.<br />התחילי לגלות ספרים מדהימים!</p>
            <a href="/book" className="browse-btn">
              גלה/י ספרים
            </a>
          </div>
        ) : (
          books.map(book => (
            <BookItem key={book.id} book={book} setBooks={setBooks} />
          ))
        )}
      </div>
    </div>
  );
}