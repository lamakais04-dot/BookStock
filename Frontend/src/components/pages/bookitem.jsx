import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../csspages/BookItem.css";
import Favorites from "../services/favorites";
import Library from "../services/library";
import { useAuth } from "../context/AuthContext";

export default function BookItem({ book, setBooks }) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [borrowMsg, setBorrowMsg] = useState("");
  const [borrowError, setBorrowError] = useState("");
  const [borrowLoading, setBorrowLoading] = useState(false);

  const isBorrowedByMe = Boolean(
    user?.borrowedBooks?.includes(book.id)
  );

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  // ===== Favorites =====
  useEffect(() => {
    async function loadFavs() {
      if (!user) return;
      try {
        const favs = await Favorites.getFavorites();
        const ids = favs.map(f => f.bookid);
        setIsFavorite(ids.includes(book.id));
      } catch {}
    }
    loadFavs();
  }, [book.id, user]);

  const handleLike = async () => {
    if (!user) return alert("יש להתחבר כדי להוסיף למועדפים");
    try {
      if (isFavorite) {
        await Favorites.remove(book.id);
        setIsFavorite(false);
      } else {
        await Favorites.add(book.id);
        setIsFavorite(true);
      }
    } catch {}
  };

  // ===== Borrow =====
  const handleBorrow = async () => {
    setBorrowLoading(true);
    setBorrowMsg("");
    setBorrowError("");

    try {
      const res = await Library.borrowBook(book.id);

      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));

      // 🔥 עדכון מקומי – הסדר נשמר
      setBooks(prev =>
        prev.map(b =>
          b.id === book.id
            ? { ...b, quantity: b.quantity - 1 }
            : b
        )
      );

      setBorrowMsg(res.message);
    } catch {
      setBorrowError("לא ניתן להשאיל את הספר");
    } finally {
      setBorrowLoading(false);
    }
  };

  // ===== Return =====
  const handleReturn = async () => {
    setBorrowLoading(true);
    setBorrowMsg("");
    setBorrowError("");

    try {
      const res = await Library.returnBook(book.id);

      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));

      // 🔥 עדכון מקומי
      setBooks(prev =>
        prev.map(b =>
          b.id === book.id
            ? { ...b, quantity: b.quantity + 1 }
            : b
        )
      );

      setBorrowMsg(res.message);
    } catch {
      setBorrowError("שגיאה בהחזרת הספר");
    } finally {
      setBorrowLoading(false);
    }
  };

  const borrowDisabled =
    !user ||
    borrowLoading ||
    (!user.canBorrow && !isBorrowedByMe) ||
    book.quantity === 0;

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
              : book.quantity === 0
              ? "לא זמין"
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
        >
          {isFavorite ? "❤️" : "♡"}
        </span>
      </div>

      {borrowMsg && <p className="borrow-success">{borrowMsg}</p>}
      {borrowError && <p className="borrow-error">{borrowError}</p>}
    </div>
  );
}
