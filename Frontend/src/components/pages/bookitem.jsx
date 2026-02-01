import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../csspages/BookItem.css";
import Favorites from "../services/favorites";
import Library from "../services/library";
import { useAuth } from "../context/AuthContext";

export default function BookItem({ book, setBooks, mode = "all" }) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const isBorrowedByMe = Boolean(
    user?.borrowedBooks?.includes(book.id)
  );

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  /* ================= Favorites ================= */
  useEffect(() => {
    if (!user || mode === "profile") return;

    async function loadFavorites() {
      try {
        const favs = await Favorites.getFavorites();
        const ids = favs.map(f => f.bookid);
        setIsFavorite(ids.includes(book.id));
      } catch {}
    }

    loadFavorites();
  }, [book.id, user, mode]);

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

  /* ================= Borrow ================= */
  const handleBorrow = async () => {
    setLoading(true);
    setMsg("");
    setError("");

    try {
      const res = await Library.borrowBook(book.id);

      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));

      // עדכון כמות מקומי בלי לשנות סדר
      setBooks?.(prev =>
        prev.map(b =>
          b.id === book.id ? { ...b, quantity: b.quantity - 1 } : b
        )
      );

      setMsg(res.message);
    } catch {
      setError("לא ניתן להשאיל את הספר");
    } finally {
      setLoading(false);
    }
  };

  /* ================= Return ================= */
  const handleReturn = async () => {
    setLoading(true);
    setMsg("");
    setError("");

    try {
      const res = await Library.returnBook(book.id);

      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));

      if (mode === "profile") {
        // בפרופיל – הספר נעלם
        setBooks?.(prev => prev.filter(b => b.id !== book.id));
      } else {
        // ברשימת הספרים – רק הכמות עולה
        setBooks?.(prev =>
          prev.map(b =>
            b.id === book.id ? { ...b, quantity: b.quantity + 1 } : b
          )
        );
      }

      setMsg(res.message);
    } catch {
      setError("שגיאה בהחזרת הספר");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  const borrowDisabled =
    !user ||
    loading ||
    book.quantity === 0 ||
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

        {/* ===== PROFILE MODE ===== */}
        {mode === "profile" ? (
          <button
            className="return-btn"
            onClick={handleReturn}
            disabled={loading}
          >
            {loading ? "מחזיר..." : "החזר ספר"}
          </button>
        ) : (
          <>
            {isBorrowedByMe ? (
              <button
                className="return-btn"
                onClick={handleReturn}
                disabled={loading}
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
                  : loading
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
          </>
        )}
      </div>

      {msg && <p className="borrow-success">{msg}</p>}
      {error && <p className="borrow-error">{error}</p>}
    </div>
  );
}
