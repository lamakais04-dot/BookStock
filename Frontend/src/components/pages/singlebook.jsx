import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Books from "../services/books";
import Filters from "../services/filtirs";
import Library from "../services/library";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import "../csspages/singleBook.css";

export default function SingleBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = id === "new";
  const bookId = isNew ? null : Number(id);

  const { user, setUser } = useAuth();
  const isAdmin = user?.role === "admin";
  
  // States for data and UI
  const [book, setBook] = useState({
    title: "", author: "", summary: "", pages: "", quantity: "", categoryid: "", agesid: "", image: ""
  });
  const [loading, setLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew || new URLSearchParams(location.search).get("edit") === "true");
  
  // Metadata for dropdowns
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  // User relations
  const isBorrowedByMe = user?.borrowedBooks?.includes(bookId);
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(bookId);

  useEffect(() => {
    async function loadPageData() {
      try {
        // Load filter lists for the dropdowns
        const [cats, ages] = await Promise.all([
          Filters.getCategories(),
          Filters.getAgeGroups()
        ]);
        setCategories(cats);
        setAgeGroups(ages);

        if (!isNew) {
          const data = await Books.getBookById(id);
          setBook(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPageData();
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const dataToSend = { ...book, image: imageFile };
      if (isNew) {
        await Books.addBook(dataToSend);
        alert("הספר נוסף בהצלחה!");
      } else {
        await Books.updateBook(id, dataToSend);
        alert("הספר עודכן בהצלחה!");
      }
      setIsEditing(false);
      navigate("/book");
    } catch (err) {
      alert("שגיאה בשמירת הנתונים");
    }
  };

  const handleBorrow = async () => {
    try {
      const res = await Library.borrowBook(bookId);
      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));
      setBook(prev => ({ ...prev, quantity: prev.quantity - 1 }));
    } catch {
      alert("לא ניתן להשאיל");
    }
  };

  const handleReturn = async () => {
    try {
      const res = await Library.returnBook(bookId);
      setUser(prev => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow
      }));
      setBook(prev => ({ ...prev, quantity: prev.quantity + 1 }));
    } catch {
      alert("שגיאה בהחזרת הספר");
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="single-book-container">
      <button className="back-button" onClick={() => navigate("/book")}>← חזרה לקטלוג</button>

      <div className={`single-book ${isEditing ? "editing-active" : ""}`}>
        
        {/* IMAGE SECTION */}
        <div className="book-image-wrapper">
          <div className="book-image">
            <img src={imageFile ? URL.createObjectURL(imageFile) : (book.image || "placeholder.png")} alt={book.title} />
          </div>
          {isEditing && (
            <div className="image-upload-input">
               <label>החלף תמונה:</label>
               <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
            </div>
          )}
        </div>

        {/* CONTENT SECTION */}
        <div className="book-details">
          {isEditing ? (
            /* ================= EDIT MODE (INPUTS) ================= */
            <div className="edit-form-local">
              <h2 className="edit-title">{isNew ? "הוספת ספר חדש" : "עריכת פרטי ספר"}</h2>
              
              <input name="title" value={book.title} onChange={handleChange} placeholder="כותרת הספר" className="form-input" />
              <input name="author" value={book.author} onChange={handleChange} placeholder="שם הסופר" className="form-input" />
              <textarea name="summary" value={book.summary} onChange={handleChange} placeholder="תקציר העלילה" className="form-textarea" />
              
              <div className="form-row">
                <input name="pages" type="number" value={book.pages} onChange={handleChange} placeholder="עמודים" />
                <input name="quantity" type="number" value={book.quantity} onChange={handleChange} placeholder="כמות במלאי" />
              </div>

              <div className="form-row">
                <select name="categoryid" value={book.categoryid} onChange={handleChange}>
                  <option value="">בחר קטגוריה</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select name="agesid" value={book.agesid} onChange={handleChange}>
                  <option value="">טווח גילאים</option>
                  {ageGroups.map(a => <option key={a.id} value={a.id}>{a.description}</option>)}
                </select>
              </div>

              <div className="edit-actions">
                <button className="save-button" onClick={handleSave}>💾 שמור שינויים</button>
                {!isNew && <button className="cancel-button" onClick={() => setIsEditing(false)}>ביטול</button>}
              </div>
            </div>
          ) : (
            /* ================= VIEW MODE (READ ONLY) ================= */
            <>
              <h1 className="book-title">{book.title}</h1>
              <p className="book-author">מאת {book.author}</p>
              <div className="book-summary">{book.summary}</div>

              <div className="book-info-grid">
                <div className="info-item">
                  <span className="info-label">מספר עמודים</span>
                  <span className="info-value">{book.pages}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">כמות במלאי</span>
                  <span className="info-value">{book.quantity}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">קטגוריה</span>
                  <span className="info-value">{book.categoryName || "כללי"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">טווח גילאים</span>
                  <span className="info-value">{book.ageRangeName || "כל הגילאים"}</span>
                </div>
              </div>

              <div className="book-actions">
                {isAdmin ? (
                  <button className="edit-toggle-button" onClick={() => setIsEditing(true)}>✏️ ערוך פרטי ספר</button>
                ) : (
                  <>
                    {isBorrowedByMe ? (
                      <button className="borrow-button return" onClick={handleReturn}>החזרה</button>
                    ) : (
                      <button 
                        className="borrow-button" 
                        onClick={handleBorrow} 
                        disabled={!user || !user.canBorrow || book.quantity === 0}
                      >
                        {!user ? "התחברי כדי להשאיל" : book.quantity === 0 ? "אזל מהמלאי" : !user.canBorrow ? "הגעת למקסימום השאלות" : "השאלת ספר"}
                      </button>
                    )}
                    <button 
                      className={`favorite-button ${isFavorite ? "active" : ""}`} 
                      onClick={() => toggleFavorite(bookId)}
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