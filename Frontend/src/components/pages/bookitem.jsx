import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../csspages/BookItem.css";
import Favorites from "../services/favorites";
import Books from "../services/books";
import Library from "../services/library";
import { useAuth } from "../context/AuthContext";

export default function BookItem({
  book,
  setBooks,
  isAdmin = false,
  mode = "all",
}) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const isBorrowedByMe = Boolean(user?.borrowedBooks?.includes(book.id));

  // Regular click navigates to view
  const handleClick = () => navigate(`/book/${book.id}`);

  useEffect(() => {
    if (!user || isAdmin || mode === "profile") return;
    async function loadFavorites() {
      try {
        const favs = await Favorites.getFavorites();
        const ids = favs.map(f => f.bookid);
        setIsFavorite(ids.includes(book.id));
      } catch {}
    }
    loadFavorites();
  }, [book.id, user, isAdmin, mode]);

  useEffect(() => {
    if (msg || error) {
      const timer = setTimeout(() => {
        setMsg("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [msg, error]);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    await Books.deleteBook(book.id);
    setBooks(prev => prev.filter(b => b.id !== book.id));
  };

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

  const handleBorrow = async () => {
    setLoading(true);
    try {
      const res = await Library.borrowBook(book.id);
      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow,
      }));
      setBooks?.(prev => prev.map(b => b.id === book.id ? { ...b, quantity: b.quantity - 1 } : b));
      setMsg(res.message);
    } catch {
      setError("לא ניתן להשאיל את הספר");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    setLoading(true);
    try {
      const res = await Library.returnBook(book.id);
      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow,
      }));
      if (mode === "profile") {
        setBooks?.(prev => prev.filter(b => b.id !== book.id));
      } else {
        setBooks?.(prev => prev.map(b => b.id === book.id ? { ...b, quantity: b.quantity + 1 } : b));
      }
      setMsg(res.message);
    } catch {
      setError("שגיאה בהחזרת הספר");
    } finally {
      setLoading(false);
    }
  };

  const borrowDisabled = !user || loading || book.quantity === 0 || (!user.canBorrow && !isBorrowedByMe);

  return (
    <div className="book-card">
      <div className="book-image" onClick={handleClick}>
        <img src={book.image} alt={book.title} />
      </div>

      <h3 className="book-title" onClick={handleClick}>{book.title}</h3>
      <p className="book-meta">{book.pages} עמודים</p>
      <p className="book-meta">{book.quantity} ספרים זמינים</p>

      {isAdmin ? (
        <div className="admin-actions">
          {/* Navigates to SingleBook with a query param to trigger edit mode */}
          <button className="edit-btn" onClick={(e) => {
            e.stopPropagation();
            navigate(`/book/${book.id}?edit=true`);
          }}>✏️ ערוך</button>
          <button className="delete-btn" onClick={handleDelete}>🗑 מחק</button>
        </div>
      ) : (
        <div className="book-actions">
          {mode === "profile" ? (
            <button className="return-btn" onClick={handleReturn} disabled={loading}>
              {loading ? "מחזיר..." : "החזר ספר"}
            </button>
          ) : (
            <>
              {isBorrowedByMe ? (
                <button className="return-btn" onClick={handleReturn} disabled={loading}>החזרה</button>
              ) : (
                <button className="borrow-btn" onClick={handleBorrow} disabled={borrowDisabled}>
                  {!user ? "התחברי כדי להשאיל" : book.quantity === 0 ? "לא זמין" : !user.canBorrow ? "הגעת למקסימום השאלות" : loading ? "טוען..." : "השאל ספר"}
                </button>
              )}
              <span onClick={handleLike} className={`heart ${isFavorite ? "active" : ""}`}>
                {isFavorite ? "❤️" : "♡"}
              </span>
            </>
          )}
        </div>
      )}

      {msg && <p className="borrow-success">{msg}</p>}
      {error && <p className="borrow-error">{error}</p>}
    </div>
  );
}