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
  isAdmin,
  setEditBook,
  mode = "all"
}) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

    const isBorrowedByMe = Boolean(
        user?.borrowedBooks?.includes(book.id)
    );

    const handleClick = () => {
        navigate(`/book/${book.id}`);
    };

  /* ===== ADMIN DELETE ===== */
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    await Books.deleteBook(book.id);
    setBooks(prev => prev.filter(b => b.id !== book.id));
  };

  /* ===== FAVORITES (USER ONLY) ===== */
  useEffect(() => {
    if (!user || isAdmin) return;
    Favorites.getFavorites().then(favs => {
      setIsFavorite(favs.map(f => f.bookid).includes(book.id));
    });
  }, [book.id, user, isAdmin]);

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
                    b.id === book.id
                        ? { ...b, quantity: b.quantity - 1 }
                        : b
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
                        b.id === book.id
                            ? { ...b, quantity: b.quantity + 1 }
                            : b
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
      <p className="book-meta">{book.pages} עמודים</p>
      <p className="book-meta">{book.quantity} זמינים</p>

      {/* ===== ADMIN ===== */}
      {isAdmin && (
        <div className="admin-actions">
          <button onClick={() => setEditBook(book)}>✏️ ערוך</button>
          <button onClick={handleDelete}>🗑 מחק</button>
        </div>
      )}

      {/* ===== USER ===== */}
      {!isAdmin && (
        <div className="book-actions">
          {isBorrowedByMe ? (
            <button onClick={handleReturn}>החזרה</button>
          ) : (
            <button
              onClick={handleBorrow}
              disabled={book.quantity === 0}
            >
              השאלה
            </button>
          )}
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