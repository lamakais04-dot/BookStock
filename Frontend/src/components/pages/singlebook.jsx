import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Books from "../services/books";
import "../csspages/singleBook.css";
import Library from "../services/library";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

export default function SingleBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookId = Number(id);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, setUser } = useAuth();
  const isBorrowedByMe = user?.borrowedBooks?.includes(bookId);

  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(bookId);

  useEffect(() => {
    async function fetchBook() {
      try {
        const data = await Books.getBookById(id);
        setBook(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  if (loading || !book) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="loading-text">טוען ספר...</p>
        </div>
      </div>
    );
  }

  const handleBorrow = async () => {
    try {
      const res = await Library.borrowBook(bookId);
      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));
    } catch {
      alert("לא ניתן להשאיל");
    }
  };

  const handleReturn = async () => {
    const res = await Library.returnBook(bookId);
    setUser(prev => ({
      ...prev,
      borrowedBooks: res.borrowedBooks,
      canBorrow: res.canBorrow
    }));
  };

  return (
    <div className="single-book-container">

      {/* ===== BACK BUTTON ===== */}
      <button className="back-button" onClick={() => navigate(-1)}>
        ← חזרה
      </button>

      <div className="single-book">

        {/* IMAGE */}
        <div className="book-image-wrapper">
          <div className="book-image">
            <img src={book.image} alt={book.title} />
          </div>
        </div>

        {/* DETAILS */}
        <div className="book-details">
          <h1 className="book-title">{book.title}</h1>

          <p className="book-author">מאת {book.author}</p>

          <div className="book-summary">
            {book.summary}
          </div>

          <div className="book-info-grid">
            <div className="info-item">
              <span className="info-label">מספר עמודים</span>
              <span className="info-value">{book.pages}</span>
            </div>

            <div className="info-item">
              <span className="info-label">כמות במלאי</span>
              <span className="info-value">{book.quantity}</span>
            </div>

            <div className="info-item">
              <span className="info-label">קטגוריה</span>
              <span className="info-value">{book.categoryName}</span>
            </div>

            <div className="info-item">
              <span className="info-label">טווח גילאים</span>
              <span className="info-value">{book.ageRangeName}</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="book-actions">
            {isBorrowedByMe ? (
              <button className="borrow-button return" onClick={handleReturn}>
                החזרה
              </button>
            ) : (
              <button
                className="borrow-button"
                onClick={handleBorrow}
                disabled={!user || !user.canBorrow}
              >
                {!user
                  ? "התחברי כדי להשאיל"
                  : !user.canBorrow
                    ? "הגעת למקסימום השאלות"
                    : "השאלת ספר"}
              </button>
            )}

            <button
              className={`favorite-button ${isFavorite ? "active" : ""}`}
              onClick={() => toggleFavorite(bookId)}
            >
              <span className="favorite-icon">
                {isFavorite ? "❤️" : "♡"}
              </span>
              {isFavorite ? "במועדפים" : "הוספה למועדפים"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
