import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../csspages/BookItem.css";
import Favorites from "../services/favorites";
import Books from "../services/books";
import Library from "../services/library";
import { useAuth } from "../context/authcontext";

// Modal Component for Delete Confirmation
function DeleteConfirmModal({ show, onClose, onConfirm, bookTitle }) { 
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon confirm">⚠️</div>
        <h2 className="modal-title">אישור מחיקה</h2>
        <p className="modal-message">
          האם אתה בטוח שברצונך למחוק את הספר<br />
          <span className="modal-book-name">"{bookTitle}"</span>?<br />
          <strong>פעולה זו לא ניתנת לביטול!</strong>
        </p>
        <div className="modal-buttons">
          <button
            className="modal-btn modal-btn-danger"
            onClick={onConfirm}
          >
            כן, מחק
          </button>
          <button
            className="modal-btn modal-btn-secondary"
            onClick={onClose}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal Component for Success (Delete/Borrow/Favorite)
function SuccessModal({ show, onClose, type, bookTitle }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getModalContent = () => {
    switch (type) {
      case "delete":
        return {
          icon: "✅",
          title: "נמחק בהצלחה!",
          message: "הספר נמחק מהמערכת בהצלחה",
          iconClass: "success"
        };
      case "borrow":
        return {
          icon: "📚",
          title: "הושאל בהצלחה!",
          message: `הספר "${bookTitle}" נוסף להשאלות שלך`,
          iconClass: "borrow"
        };
      case "return":
        return {
          icon: "✨",
          title: "הוחזר בהצלחה!",
          message: `הספר "${bookTitle}" הוחזר למערכת`,
          iconClass: "return"
        };
      case "favorite-add":
        return {
          icon: "❤️",
          title: "נוסף למועדפים!",
          message: `הספר "${bookTitle}" נוסף למועדפים שלך`,
          iconClass: "favorite"
        };
      case "favorite-remove":
        return {
          icon: "💔",
          title: "הוסר מהמועדפים",
          message: `הספר "${bookTitle}" הוסר מהמועדפים שלך`,
          iconClass: "unfavorite"
        };
      default:
        return {
          icon: "✅",
          title: "הצליח!",
          message: "הפעולה בוצעה בהצלחה",
          iconClass: "success"
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-success">
        <div className={`modal-icon ${content.iconClass}`}>
          {content.icon}
        </div>
        <h2 className="modal-title">{content.title}</h2>
        <p className="modal-message">{content.message}</p>
      </div>
    </div>
  );
}

export default function BookItem({
  book,
  setBooks, // פונקציה לעדכון הרשימה 
  isAdmin = false,
  mode = "all", // all | profile
  onLocalBorrow, //עדכון מקומי אחרי השאלה
  onLocalReturn,
  onLocalDelete,
}) {
  const navigate = useNavigate();
  const { user, setUser, isBlocked } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockedModalMessage, setBlockedModalMessage] = useState("");

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successModal, setSuccessModal] = useState({
    show: false,
    type: null
  });

  const isBorrowedByMe = Boolean(
    user?.borrowedBooks?.includes(book.id)
  );

  const handleClick = () => navigate(`/book/${book.id}`);

  /* BLOCK GUARD */
  const blockActionIfBlocked = (
    text = "החשבון שלך חסום — לא ניתן לבצע פעולה זו"
  ) => {
    if (isBlocked) {
      setError(text);
      setBlockedModalMessage(text);
      return true;
    }
    return false;
  };

  // load favorites once
  useEffect(() => {
    if (!user || isAdmin || mode === "profile") return;
    async function loadFavorites() {
      try {
        const favs = await Favorites.getFavorites();
        const ids = favs.map((f) => f.bookid);
        setIsFavorite(ids.includes(book.id));
      } catch {
        // ignore
      }
    }
    loadFavorites();
  }, [book.id, user, isAdmin, mode]);

  // auto-clear error
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    const hasModalOpen = showDeleteModal || successModal.show;
    document.body.classList.toggle("book-modal-open", hasModalOpen);
    return () => {
      document.body.classList.remove("book-modal-open");
    };
  }, [showDeleteModal, successModal.show]);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (blockActionIfBlocked("החשבון שלך חסום — לא ניתן למחוק ספרים")) return;
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await Books.deleteBook(book.id);
      setShowDeleteModal(false);
      if (onLocalDelete) {
        onLocalDelete(book);
      } else {
        setBooks?.((prev) => prev.filter((b) => b.id !== book.id));
      }
    } catch {
      setError("שגיאה במחיקת הספר");
      setShowDeleteModal(false);
    }
  };

  const handleLike = async () => {
    if (blockActionIfBlocked("החשבון שלך חסום — לא ניתן לשנות מועדפים")) return;
    if (!user) {
      setError("יש להתחבר כדי להוסיף למועדפים");
      return;
    }
    try {
      if (isFavorite) {
        await Favorites.remove(book.id);
        setIsFavorite(false);
        setSuccessModal({ show: true, type: "favorite-remove" });
      } else {
        await Favorites.add(book.id);
        setIsFavorite(true);
        setSuccessModal({ show: true, type: "favorite-add" });
      }
    } catch {
      // optional error
    }
  };

  const handleBorrow = async () => {
    if (blockActionIfBlocked("החשבון שלך חסום — לא ניתן להשאיל ספרים")) return;
    if (!user) {
      setError("יש להתחבר כדי להשאיל ספרים");
      return;
    }
    setLoading(true);
    try {
      const res = await Library.borrowBook(book.id);
      setUser((prev) => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow,
      }));
      if (onLocalBorrow) {
        onLocalBorrow(book.id);
      } else {
        setBooks?.((prev) =>
          prev.map((b) =>
            b.id === book.id
              ? { ...b, quantity: Math.max(0, b.quantity - 1) }
              : b
          )
        );
      }
      setSuccessModal({ show: true, type: "borrow" });
    } catch {
      setError("לא ניתן להשאיל את הספר");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (blockActionIfBlocked("החשבון שלך חסום — לא ניתן להחזיר ספרים")) return;
    if (!user) {
      setError("יש להתחבר כדי להחזיר ספרים");
      return;
    }
    setLoading(true);
    try {
      const res = await Library.returnBook(book.id);
      setUser((prev) => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow,
      }));
      setSuccessModal({ show: true, type: "return" });
      if (mode === "profile") {
        setTimeout(() => {
          setBooks?.((prev) => prev.filter((b) => b.id !== book.id));
        }, 1200);
      } else if (onLocalReturn) {
        onLocalReturn(book.id);
      } else {
        setBooks?.((prev) =>
          prev.map((b) =>
            b.id === book.id
              ? { ...b, quantity: b.quantity + 1 }
              : b
          )
        );
      }
    } catch {
      setError("שגיאה בהחזרת הספר");
    } finally {
      setLoading(false);
    }
  };

  const borrowDisabled =
    !user ||
    loading ||
    book.quantity === 0 ||
    (!user.canBorrow && !isBorrowedByMe);

  return (
    <>
      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        bookTitle={book.title}
      />

      <SuccessModal
        show={successModal.show}
        onClose={() => setSuccessModal({ show: false, type: null })}
        type={successModal.type}
        bookTitle={book.title}
      />

      {blockedModalMessage && (
        <div className="modal-overlay" onClick={() => setBlockedModalMessage("")}>
          <div className="modal-content modal-success" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon confirm">🚫</div>
            <h2 className="modal-title">פעולה חסומה</h2>
            <p className="modal-message">{blockedModalMessage}</p>
            <button type="button" className="modal-btn modal-btn-secondary" onClick={() => setBlockedModalMessage("")}>הבנתי</button>
          </div>
        </div>
      )}

      <div className="book-card">
        {/* Image with heart floating on top */}
        <div className="book-image" onClick={handleClick}>
          <img src={book.image} alt={book.title} />
        </div>

        {/* Heart floats over image — only for non-admin, non-profile mode */}
        {!isAdmin && mode !== "profile" && (
          <span
            className={`heart ${isFavorite ? "active" : ""}`}
            onClick={handleLike}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 10,
            }}
          >
            {isFavorite ? "❤️" : "♡"}
          </span>
        )}

        {/* Card body */}
        <div className="card-body">
          <h3 className="book-title" onClick={handleClick}>
            {book.title}
          </h3>

          <p className="book-meta">{book.quantity} ספרים זמינים</p>
          <p className="book-meta">{book.pages} עמודים</p>

          {isAdmin ? (
            <div className="admin-actions">
              <button
                type="button"
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (blockActionIfBlocked("החשבון שלך חסום — לא ניתן לערוך ספרים")) return;
                  navigate(`/book/${book.id}?edit=true`);
                }}
              >
                ✏️ ערוך
              </button>
              <button
                type="button"
                className="delete-btn"
                onClick={handleDeleteClick}
              >
                🗑 מחק
              </button>
            </div>
          ) : (
            <div className="book-actions">
              {mode === "profile" ? (
                <button
                  type="button"
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
                      type="button"
                      className="return-btn"
                      onClick={handleReturn}
                      disabled={loading}
                    >
                      החזרה
                    </button>
                  ) : (
                    <button
                      type="button"
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
                </>
              )}
            </div>
          )}

          {error && <p className="borrow-error">{error}</p>}
        </div>
      </div>
    </>
  );
}
