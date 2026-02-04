import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Books from "../services/books";
import Filters from "../services/filtirs";
import Library from "../services/library";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import BookForm from "./BookForm";
import "../csspages/singleBook.css";

/* ================= SINGLE BOOK ================= */
export default function SingleBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();


  const isNew = id === "new";
  const bookId = isNew ? null : Number(id);

  const { user, setUser, isBlocked } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const isAdmin = user?.role === "admin";

  const [loading, setLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(
    isNew || new URLSearchParams(location.search).get("edit") === "true"
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  const [book, setBook] = useState({
    title: "",
    author: "",
    summary: "",
    pages: "",
    quantity: "",
    categoryid: "",
    agesid: "",
    image: ""
  });

  const isBorrowedByMe = user?.borrowedBooks?.includes(bookId);
  const isFavorite = favorites.includes(bookId);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    async function loadData() {
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
    loadData();
  }, [id, isNew]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setBook(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async (formData) => {
    try {
      const payload = { ...book, image: imageFile };

      if (isNew) {
        await Books.addBook(payload);
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate("/book");
        }, 2000);
      } else {
        await Books.updateBook(id, payload);
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setIsEditing(false);
        }, 2000);
      }
    } catch (err) {
      alert("שגיאה בשמירה");
    }
  };

  const handleBorrow = async () => {
    if (isBlocked) return;

    const res = await Library.borrowBook(bookId);
    setUser(prev => ({
      ...prev,
      borrowedBooks: res.borrowedBooks,
      canBorrow: res.canBorrow
    }));

    setBook(prev => ({ ...prev, quantity: prev.quantity - 1 }));
  };

  const handleReturn = async () => {
    if (isBlocked) return;

    const res = await Library.returnBook(bookId);
    setUser(prev => ({
      ...prev,
      borrowedBooks: res.borrowedBooks,
      canBorrow: res.canBorrow
    }));

    setBook(prev => ({ ...prev, quantity: prev.quantity + 1 }));
  };

  if (loading) return <div>טוען...</div>;

  const categoryName =
    categories.find(c => c.id === book.categoryid)?.name || "—";

  const ageName =
    ageGroups.find(a => a.id === book.agesid)?.description || "—";

  /* ================= JSX ================= */
  return (
    <div className="single-book-container">
      <button className="back-button" onClick={() => navigate("/book")}>
        ← חזרה
      </button>

      <div className="single-book">
      <div className="single-book">
        <div className="book-image-wrapper">
          <div className="book-image">
            <img
              src={
                imageFile
                  ? URL.createObjectURL(imageFile)
                  : book.image || "/placeholder.png"
              }
              alt={book.title}
            />
          </div>

          {isEditing && (
            <div className="image-upload-section">
              <div className="image-upload-input">
                <label>העלה תמונת ספר</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </div>
            </div>
          )}
        </div>

        <div className="book-details">
          {isEditing ? (
            <div className="edit-form-local">
              <h2 className="edit-title">
                {isNew ? "הוספת ספר חדש" : "עריכת פרטי הספר"}
              </h2>

              <div className="form-group">
                <label className="form-label">שם הספר</label>
                <input
                  className="form-input"
                  name="title"
                  value={book.title}
                  onChange={handleChange}
                  placeholder="הזן שם ספר..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">מחבר הספר</label>
                <input
                  className="form-input"
                  name="author"
                  value={book.author}
                  onChange={handleChange}
                  placeholder="הזן שם מחבר..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">תקציר הספר</label>
                <textarea
                  className="form-textarea"
                  name="summary"
                  value={book.summary}
                  onChange={handleChange}
                  placeholder="כתוב תקציר קצר על הספר..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">מספר עמודים</label>
                  <input
                    className="form-input"
                    type="number"
                    name="pages"
                    value={book.pages}
                    onChange={handleChange}
                    placeholder="עמודים"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">כמות זמינה</label>
                  <input
                    className="form-input"
                    type="number"
                    name="quantity"
                    value={book.quantity}
                    onChange={handleChange}
                    placeholder="כמות"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">בחר קטגוריה</label>
                  <select
                    className="form-select"
                    name="categoryid"
                    value={book.categoryid}
                    onChange={handleChange}
                  >
                    <option value="">בחר קטגוריה...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">טווח גילאים</label>
                  <select
                    className="form-select"
                    name="agesid"
                    value={book.agesid}
                    onChange={handleChange}
                  >
                    <option value="">בחר טווח גילאים...</option>
                    {ageGroups.map(a => (
                      <option key={a.id} value={a.id}>{a.description}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="edit-actions">
                <button className="save-button" onClick={handleSave}>
                  💾 שמור שינויים
                </button>
                {!isNew && (
                  <button
                    className="cancel-button"
                    onClick={() => setIsEditing(false)}
                  >
                    ✖ ביטול
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <h1 className="book-title">{book.title}</h1>
              <h2 className="book-author">{book.author}</h2>
              <p className="book-summary">{book.summary}</p>

              <div className="book-info-grid">
                <div className="info-item">
                  <div className="info-label">קטגוריה</div>
                  <div className="info-value">{categoryName}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">גילאים</div>
                  <div className="info-value">{ageName}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">עמודים</div>
                  <div className="info-value">{book.pages}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">כמות זמינה</div>
                  <div className="info-value">{book.quantity}</div>
                </div>
              </div>

              <div className="book-actions">
                {isAdmin ? (
                  <button 
                    className="edit-toggle-button"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ עריכה
                  </button>
                ) : (
                  <>
                    {isBorrowedByMe ? (
                      <button 
                        className="borrow-button"
                        onClick={handleReturn}
                      >
                        📚 החזרת ספר
                      </button>
                    ) : (
                      <button
                        className="borrow-button"
                        onClick={handleBorrow}
                        disabled={!user || !user.canBorrow || book.quantity === 0}
                        disabled={!user || !user.canBorrow || book.quantity === 0}
                      >
                        📖 השאלת ספר
                      </button>
                    )}

                    <button 
                      className="favorite-button"
                      onClick={() => toggleFavorite(bookId)}
                    >
                      {isFavorite ? "❤️ הסר ממועדפים" : "🤍 הוסף למועדפים"}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon success">✓</div>
            <h3 className="modal-title">
              {isNew ? "הספר נוסף בהצלחה!" : "השינויים נשמרו בהצלחה!"}
            </h3>
            <p className="modal-message">
              {isNew 
                ? "הספר נוסף למערכת ויהיה זמין לכל המשתמשים"
                : "פרטי הספר עודכנו במערכת"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}