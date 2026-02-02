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

  const isBorrowedByMe =
    user?.borrowedBooks?.includes(book.id);

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
    if (isFavorite) {
      await Favorites.remove(book.id);
      setIsFavorite(false);
    } else {
      await Favorites.add(book.id);
      setIsFavorite(true);
    }
  };

  /* ===== BORROW / RETURN (USER ONLY) ===== */
  const handleBorrow = async () => {
    const res = await Library.borrowBook(book.id);
    setUser(prev => ({ ...prev, borrowedBooks: res.borrowedBooks }));
    setBooks(prev =>
      prev.map(b =>
        b.id === book.id ? { ...b, quantity: b.quantity - 1 } : b
      )
    );
  };

  const handleReturn = async () => {
    const res = await Library.returnBook(book.id);
    setUser(prev => ({ ...prev, borrowedBooks: res.borrowedBooks }));
    setBooks(prev =>
      prev.map(b =>
        b.id === book.id ? { ...b, quantity: b.quantity + 1 } : b
      )
    );
  };

  return (
    <div className="book-card">
      <div className="book-image" onClick={handleClick}>
        <img src={book.image} alt={book.title} />
      </div>

      <h3 className="book-title" onClick={handleClick}>
        {book.title}
      </h3>

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

          <span onClick={handleLike}>
            {isFavorite ? "❤️" : "♡"}
          </span>
        </div>
      )}
    </div>
  );
}
