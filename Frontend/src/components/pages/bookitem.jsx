import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../csspages/BookItem.css";
import Favorites from "../services/favorites";
import Library from "../services/library";
import { useAuth } from "../context/AuthContext";

export default function BookItem({ book }) {
  const navigate = useNavigate();
  const { user, setUser, fetchUser } = useAuth();

  // ===== Favorites State =====
  const [isFavorite, setIsFavorite] = useState(false);

  // ===== Borrow UI State =====
  const [borrowMsg, setBorrowMsg] = useState("");
  const [borrowError, setBorrowError] = useState("");
  const [borrowLoading, setBorrowLoading] = useState(false);

  // האם הספר הזה מושאל על ידי המשתמש
  const isBorrowedByMe = Boolean(
    user?.borrowedBooks?.includes(book.id)
  );

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  // ===== Load favorites =====
  useEffect(() => {
    async function checkFavorite() {
      if (!user) return;
      try {
        const favs = await Favorites.getFavorites();
        const ids = favs.map(f => f.bookid);
        setIsFavorite(ids.includes(book.id));
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    }
    checkFavorite();
  }, [book.id, user]);

  // ===== Toggle favorite =====
  const handleLike = async () => {
    if (!user) {
      alert("יש להתחבר כדי להוסיף למועדפים");
      return;
    }
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

  // ===== Borrow =====
  const handleBorrow = async () => {
    setBorrowMsg("");
    setBorrowError("");
    setBorrowLoading(true);

    try {
      const res = await Library.borrowBook(book.id);

      setBorrowMsg(res.message || "📚 הספר הושאל בהצלחה");

      console.log(res.borrowedBooks)
      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));

      
    } catch (err) {
      setBorrowError(
        err?.response?.data?.detail || "לא ניתן להשאיל את הספר כרגע"
      );
    } finally {
      setBorrowLoading(false);
    }
  };

  // ===== Return =====
  const handleReturn = async () => {
    setBorrowMsg("");
    setBorrowError("");
    setBorrowLoading(true);

    try {
      const res = await Library.returnBook(book.id);

      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));
    } catch (err) {
      setBorrowError("שגיאה בהחזרת הספר");
    } finally {
      setBorrowLoading(false);
    }
  };

  // ===== Disable logic =====
  // חשוב: לא חוסמים ספר שמושאל על ידך
  const borrowDisabled =
    !user ||
    borrowLoading ||
    (!user.canBorrow && !isBorrowedByMe);

  return (
    <div className="book-card">
      <div className="book-image" onClick={handleClick}>
        <img src={book.image} alt={book.title} />
      </div>

      <h3 className="book-title" onClick={handleClick}>
        {book.title}
      </h3>

      <p className="book-meta">{book.pages} עמודים</p>
      <p className="book-meta">{book.quantity} ספרים זמינים</p>

      <div className="book-actions">
        {isBorrowedByMe ? (
          <button
            className="return-btn"
            onClick={handleReturn}
            disabled={borrowLoading}
          >
            החזרה
          </button>
        ) : (
          <button
            className="borrow-btn"
            onClick={handleBorrow}
            disabled={borrowDisabled}
          >
            {!user
              ? "התחברי כדי להשאיל"
              : !user.canBorrow
              ? "הגעת למקסימום השאלות"
              : borrowLoading
              ? "טוען..."
              : "השאל ספר"}
          </button>
        )}

        <span
          onClick={handleLike}
          className={`heart ${isFavorite ? "active" : ""}`}
          style={{ cursor: "pointer" }}
        >
          {isFavorite ? "❤️" : "♡"}
        </span>
      </div>

      {borrowMsg && <p className="borrow-success">{borrowMsg}</p>}
      {borrowError && <p className="borrow-error">{borrowError}</p>}
    </div>
  );
}
