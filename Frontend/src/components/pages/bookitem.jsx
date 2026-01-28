import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../csspages/BookItem.css";
import Favorites from "../services/favorites";
import Library from "../services/library";

export default function BookItem({ book }) {
  const navigate = useNavigate();

  // ===== Favorites =====
  const [isFavorite, setIsFavorite] = useState(false);

  // ===== Borrow UI (no alert) =====
  const [borrowMsg, setBorrowMsg] = useState("");
  const [borrowError, setBorrowError] = useState("");
  const [borrowDisabled, setBorrowDisabled] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  // 🔹 בדיקה אם הספר כבר במועדפים
  useEffect(() => {
    async function checkFavorite() {
      try {
        const favs = await Favorites.getFavorites();
        const ids = favs.map((f) => f.bookid);
        setIsFavorite(ids.includes(book.id));
      } catch (err) {
        console.error(err);
      }
    }

    checkFavorite();
  }, [book.id]);

  // ❤️ TOGGLE Favorites
  const handleLike = async () => {
    try {
      if (isFavorite) {
        await Favorites.remove(book.id);
        setIsFavorite(false);
      } else {
        await Favorites.add(book.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 📚 Borrow (adds to library book1id/book2id) - no alert
  const handleBorrow = async () => {
    setBorrowMsg("");
    setBorrowError("");
    setBorrowLoading(true);

    try {
      const res = await Library.borrowBook(book.id);

      // הודעה יפה (אם בא מהשרת - נציג, אחרת ברירת מחדל)
      setBorrowMsg(res?.message || "📚 הספר נוסף לספרייה שלך");
      setBorrowDisabled(true);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "לא ניתן להשאיל ספר נוסף";

      setBorrowError(msg);
      setBorrowDisabled(true);
    } finally {
      setBorrowLoading(false);
    }
  };

  return (
    <div className="book-card">
      <div className="book-image" onClick={handleClick}>
        <img src={book.image} alt={book.title} className="book-image" />
      </div>

      <h3 className="book-title" onClick={handleClick}>
        {book.title}
      </h3>

      <p className="book-meta">{book.pages} עמודים</p>
      <p className="book-meta">{book.quantity} ספרים זמינים</p>

      <div className="book-actions">
        <button
          className="borrow-btn"
          onClick={handleBorrow}
          disabled={borrowDisabled || borrowLoading}
        >
          {borrowLoading ? "טוען..." : borrowDisabled ? "לא זמין" : "השאל ספר"}
        </button>

        <span
          onClick={handleLike}
          className={`heart ${isFavorite ? "active" : ""}`}
        >
          {isFavorite ? "❤️" : "♡"}
        </span>
      </div>

      {/* Messages (no alert) */}
      {borrowMsg && <p className="borrow-success">{borrowMsg}</p>}
      {borrowError && <p className="borrow-error">{borrowError}</p>}
    </div>
  );
}
