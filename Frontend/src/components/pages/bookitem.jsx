import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../csspages/BookItem.css";
import Favorites from "../services/favorites";
import Books from "../services/books";
import Library from "../services/library";
import { useAuth } from "../context/AuthContext";

// Modal Component for Delete Confirmation
function DeleteConfirmModal({ show, onClose, onConfirm, bookTitle }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon confirm">⚠️</div>
        <h2 className="modal-title">אישור מחיקה</h2>
        <p className="modal-message">
          האם אתה בטוח שברצונך למחוק את הספר<br />
          <span className="modal-book-name">"{bookTitle}"</span>?<br />
          <strong>פעולה זו לא ניתנת לביטול!</strong>
        </p>
        <div className="modal-buttons">
          <button className="modal-btn modal-btn-danger" onClick={onConfirm}>
            כן, מחק
          </button>
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal Component for Success
function SuccessModal({ show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon success">✅</div>
        <h2 className="modal-title">נמחק בהצלחה!</h2>
        <p className="modal-message">הספר נמחק מהמערכת בהצלחה</p>
      </div>
    </div>
  );
}

export default function BookItem({
  book,
  setBooks,
  isAdmin = false,
  mode = "all",
}) {
  const navigate = useNavigate();
  const { user, setUser,isBlocked,isAdmin } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await Books.deleteBook(book.id);
      setShowDeleteModal(false);
      setShowSuccessModal(true);
      
      // Wait for success modal to show, then remove book
      setTimeout(() => {
        setBooks(prev => prev.filter(b => b.id !== book.id));
      }, 2500);
    } catch {
      setError("שגיאה במחיקת הספר");
      setShowDeleteModal(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      setError("יש להתחבר כדי להוסיף למועדפים");
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
    <>
      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        bookTitle={book.title}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      <div className="book-card">
        <div className="book-image" onClick={handleClick}>
          <img src={book.image} alt={book.title} />
        </div>

        <h3 className="book-title" onClick={handleClick}>{book.title}</h3>
        <p className="book-meta">{book.pages} עמודים</p>
        <p className="book-meta">{book.quantity} ספרים זמינים</p>

        {isAdmin ? (
          <div className="admin-actions">
            <button className="edit-btn" onClick={(e) => {
              e.stopPropagation();
              navigate(`/book/${book.id}?edit=true`);
            }}>✏️ ערוך</button>
            <button className="delete-btn" onClick={handleDeleteClick}>🗑 מחק</button>
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
    </>
  );
}