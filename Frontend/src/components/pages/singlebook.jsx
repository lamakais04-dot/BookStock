import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Books from "../services/books";
import Filters from "../services/filtirs";
import Library from "../services/library";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import BookForm from "./BookForm";
import "../csspages/singleBook.css";

/* ================= MODAL ================= */
function Modal({ show, onClose, title, message, type = "success", onConfirm }) {
  if (!show) return null;

  const icons = {
    success: "✅",
    error: "❌",
    confirm: "❓"
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className={`modal-icon ${type}`}>{icons[type]}</div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          {type === "confirm" ? (
            <>
              <button className="modal-btn modal-btn-danger" onClick={onConfirm}>
                כן, מחק
              </button>
              <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                ביטול
              </button>
            </>
          ) : (
            <button className="modal-btn modal-btn-primary" onClick={onClose}>
              סגור
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= SINGLE BOOK ================= */
export default function SingleBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isNew = id === "new";
  const bookId = isNew ? null : Number(id);

  const { user, setUser, isBlocked } = useAuth();
  const isAdmin = user?.role === "admin";

  /* ===== DATA ===== */
  const [book, setBook] = useState(null);
  const [allBooks, setAllBooks] = useState([]);

  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);

  const [loading, setLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(
    isNew || new URLSearchParams(location.search).get("edit") === "true"
  );

  /* ===== MODAL ===== */
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "success"
  });

  const showModal = (title, message, type = "success") =>
    setModal({ show: true, title, message, type });

  const closeModal = () =>
    setModal(prev => ({ ...prev, show: false }));

  /* ===== FAVORITES / BORROW ===== */
  const isBorrowedByMe = user?.borrowedBooks?.includes(bookId);
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(bookId);

  /* ================= LOAD PAGE ================= */
  useEffect(() => {
    async function loadData() {
      try {
        const [cats, ages, booksRes] = await Promise.all([
          Filters.getCategories(),
          Filters.getAgeGroups(),
          Books.getBooks(1, 50)
        ]);

        setCategories(cats);
        setAgeGroups(ages);
        setAllBooks(booksRes.books);


        if (!isNew) {
          const data = await Books.getBookById(id);
          setBook(data);
        } else {
          setBook({
            title: "",
            author: "",
            summary: "",
            pages: "",
            quantity: "",
            categoryid: "",
            agesid: "",
            image: ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, isNew]);

  /* ================= ACTIONS ================= */

  const handleBlockedAction = () => {
    showModal(
      "הפעולה נחסמה 🚫",
      "החשבון שלך חסום ולכן אינך יכול לבצע פעולה זו.",
      "error"
    );
  };

  const handleSave = async (formData) => {
    try {
      if (isNew) {
        await Books.addBook(formData);
        showModal("הצלחה! 🎉", "הספר נוסף בהצלחה", "success");
        setTimeout(() => navigate("/book"), 2000);
      } else {
        await Books.updateBook(bookId, formData);
        showModal("עודכן! ✨", "פרטי הספר עודכנו", "success");
        setIsEditing(false);
        setBook(prev => ({ ...prev, ...formData }));
      }
    } catch {
      showModal("שגיאה", "שמירת הספר נכשלה", "error");
    }
  };

  const handleBorrow = async () => {
    if (isBlocked) return handleBlockedAction();

    try {
      const res = await Library.borrowBook(bookId);
      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));
      setBook(prev => ({ ...prev, quantity: prev.quantity - 1 }));
      showModal("הושאל! 📚", "השאלה בוצעה בהצלחה", "success");
    } catch {
      showModal("שגיאה", "לא ניתן להשאיל כרגע", "error");
    }
  };

  const handleReturn = async () => {
    if (isBlocked) return handleBlockedAction();

    try {
      const res = await Library.returnBook(bookId);
      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));
      setBook(prev => ({ ...prev, quantity: prev.quantity + 1 }));
      showModal("הוחזר! ✅", "הספר הוחזר בהצלחה", "success");
    } catch {
      showModal("שגיאה", "החזרה נכשלה", "error");
    }
  };

  /* ================= RENDER ================= */

  if (loading || !book) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const categoryName =
    categories.find(c => c.id === book.categoryid)?.name || "כללי";

  const ageRangeName =
    ageGroups.find(a => a.id === book.agesid)?.description || "כל הגילאים";

  return (
    <div className="single-book-container">
      <Modal {...modal} onClose={closeModal} />

      <button className="back-button" onClick={() => navigate("/book")}>
        ← חזרה לקטלוג
      </button>

      <div className="single-book">
        <div className="book-image-wrapper">
          <img
            src={book.image || "placeholder.png"}
            alt={book.title}
          />
        </div>

        <div className="book-details">
          {isEditing ? (
            <BookForm
              initialData={book}
              categories={categories}
              ageGroups={ageGroups}
              existingBooks={allBooks.filter(b => b.id !== bookId)}
              onSubmit={handleSave}
            />
          ) : (
            <>
              <h1 className="book-title">{book.title}</h1>
              <p className="book-author">מאת {book.author}</p>
              <div className="book-summary">{book.summary}</div>

              <div className="book-info-grid">
                <div className="info-item">
                  <span className="info-label">עמודים</span>
                  <span className="info-value">{book.pages}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">במלאי</span>
                  <span className="info-value">{book.quantity}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">קטגוריה</span>
                  <span className="info-value">{categoryName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">גילאים</span>
                  <span className="info-value">{ageRangeName}</span>
                </div>
              </div>

              <div className="book-actions">
                {isAdmin ? (
                  <button
                    className="edit-toggle-button"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ ערוך ספר
                  </button>
                ) : (
                  <>
                    {isBorrowedByMe ? (
                      <button className="borrow-button return" onClick={handleReturn}>
                        החזרה
                      </button>
                    ) : (
                      <button
                        className="borrow-button"
                        onClick={handleBorrow}
                        disabled={!user || !user.canBorrow || book.quantity === 0}
                      >
                        {!user
                          ? "התחברי כדי להשאיל"
                          : book.quantity === 0
                            ? "אזל מהמלאי"
                            : !user.canBorrow
                              ? "הגעת למקסימום"
                              : "השאלת ספר"}
                      </button>
                    )}

                    <button
                      className={`favorite-button ${isFavorite ? "active" : ""}`}
                      onClick={() =>
                        isBlocked
                          ? handleBlockedAction()
                          : toggleFavorite(bookId)
                      }
                    >
                      {isFavorite ? "❤️ במועדפים" : "♡ הוספה למועדפים"}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
