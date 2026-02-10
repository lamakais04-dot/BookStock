// pages/SingleBook.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Books from "../services/books";
import Filters from "../services/filtirs";
import { useAuth } from "../context/AuthContext";
import BookForm from "./BookForm";
import "../csspages/singleBook.css";
import "../csspages/BookForm.css";

export default function SingleBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isFavorite, setIsFavorite] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
   const { isBlocked, setUser } = useAuth();  
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isEditMode = searchParams.get("edit") === "true";
  const isNew = !id || location.pathname === "/book/new";

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    async function loadData() {
      try {
        const [cats, ages] = await Promise.all([
          Filters.getCategories(),
          Filters.getAgeGroups(),
        ]);

        setCategories(cats);
        setAgeGroups(ages);

        // ❗❗❗ רק אם זה לא new
        if (!isNew) {
          const data = await Books.getBookById(id);
          setBook(data);
        }
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת הנתונים");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, isNew]);

  /* ================= FAVORITES ================= */
  useEffect(() => {
    if (!user || isAdmin || isNew) return;

    async function loadFavs() {
      try {
        const favs = await Favorites.getFavorites();
        setIsFavorite(favs.some((f) => f.bookid === Number(id)));
      } catch (err) {
        console.error("Failed to load favorites", err);
      }
    }

    loadFavs();
  }, [id, user, isAdmin, isNew]);

  /* ================= ACTIONS ================= */

  const handleBorrow = async () => {
    if (!user) return setError("יש להתחבר כדי להשאיל ספר");
    if (isBlocked) return setError("החשבון שלך חסום");

    setActionLoading(true);
    try {
      const res = await Library.borrowBook(book.id);

      setUser((prev) => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow,
      }));

      setBook((prev) => ({ ...prev, quantity: prev.quantity - 1 }));
    } catch {
      setError("לא ניתן להשאיל את הספר");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (isBlocked) return setError("החשבון שלך חסום");

    setActionLoading(true);
    try {
      const res = await Library.returnBook(book.id);

      setUser((prev) => ({
        ...prev,
        borrowedBooks: res.borrowedBooks,
        canBorrow: res.canBorrow,
      }));

      setBook((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
    } catch {
      setError("שגיאה בהחזרת הספר");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) return setError("יש להתחבר כדי להוסיף למועדפים");
    if (isBlocked) return setError("החשבון שלך חסום");

    try {
      if (isFavorite) {
        await Favorites.remove(book.id);
        setIsFavorite(false);
      } else {
        await Favorites.add(book.id);
        setIsFavorite(true);
      }
    } catch {
      setError("שגיאה בעדכון מועדפים");
    }
  };

  /* ================= ADMIN ================= */

  const handleUpdateBook = async (formData) => {
    if (isBlocked) {
      setError("החשבון שלך חסום — לא ניתן לערוך ספרים");
      return;
    }

    try {
      await Books.updateBook(book.id, formData);
      const updatedBook = await Books.getBookById(book.id);
      setBook(updatedBook);
      setSearchParams({});
    } catch {
      setError("שגיאה בעדכון הספר");
    }
  };

  const handleAddBook = async (formData) => {
    if (isBlocked) {
      setError("החשבון שלך חסום — לא ניתן להוסיף ספרים");
      return;
    }

    try {
      await Books.addBook(formData);
      navigate("/book");
    } catch (err) {
      const serverMsg = err?.response?.data?.detail;
      setError(serverMsg || "שגיאה בהוספת ספר");
    }
  };

  /* ================= LOADING ================= */
  if (loading) return <div className="loading-container" />;

  /* ================= ADD NEW BOOK ================= */
  if (isNew && isAdmin) {
    return (
      <div className="single-book-container">
        <button className="back-button" onClick={() => navigate("/book")}>
          ← חזרה
        </button>

        <div className="single-book">
          <div className="book-details">
            <p className="section-subtitle">מידע על הספר</p>

            <BookForm
              categories={categories}
              ageGroups={ageGroups}
              onSubmit={handleAddBook}
              mode="create"
              title="הוספת ספר חדש"
              readOnly={isBlocked}
              readOnlyMessage="החשבון שלך חסום — לא ניתן להוסיף ספרים"
            />

            {error && <p className="borrow-error">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  /* ================= SAFETY ================= */
  if (!book) return null;

  /* ================= VIEW / EDIT ================= */
  return (
    <div className="single-book-container">
      <button className="back-button" onClick={() => navigate("/book")}>
        ← חזרה
      </button>

      <div className="single-book">
        <div className="book-image">
          <img src={book.image || "/placeholder.png"} alt={book.title} />
        </div>

        <div className="book-details">
          {isAdmin && isEditMode ? (
            <>
              <p className="section-subtitle">עריכת פרטי הספר</p>

              <BookForm
                initialData={book}
                categories={categories}
                ageGroups={ageGroups}
                onSubmit={isNew ? handleAddBook : handleUpdateBook}
                mode={isNew ? "create" : "edit"}
                title={isNew ? "הוספת ספר חדש" : "עריכת ספר"}
                subtitle={
                  isNew
                    ? "מלא את כל הפרטים להוספת הספר לספרייה"
                    : "עדכן את פרטי הספר ושמור שינויים"
                }
                readOnly={isBlocked}
                readOnlyMessage={
                  isNew
                    ? "החשבון שלך חסום — לא ניתן להוסיף ספרים"
                    : "החשבון שלך חסום — לא ניתן לערוך ספרים"
                }
              />

              <button
                className="cancel-button"
                onClick={() => setSearchParams({})}
              >
                ביטול
              </button>
            </>
          ) : (
            <>
              <h1 className="book-title">{book.title}</h1>
              <p className="book-author">{book.author}</p>

              <div className="book-info-grid">
                <div className="info-item">
                  <div className="info-label">קטגוריה</div>
                  <div className="info-value">
                    {categories.find((c) => c.id === book.categoryid)?.name}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">קבוצת גיל</div>
                  <div className="info-value">
                    {ageGroups.find((a) => a.id === book.agesid)?.description}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">עמודים</div>
                  <div className="info-value">{book.pages}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">כמות</div>
                  <div className="info-value">{book.quantity}</div>
                </div>
              </div>

              {isAdmin? (
                <button
                  type="button"
                  className="edit-toggle-button"
                  onClick={() => {
                    if (isBlocked) {
                      setError("החשבון שלך חסום — לא ניתן לערוך ספרים");
                      return;
                    }
                    setSearchParams({ edit: "true" });
                  }}
                >
                  ✏️ עריכה
                </button>
              )  :(
                <div className="book-actions">
                  {isBorrowedByMe ? (
                    <button
                      type="button"
                      onClick={handleReturn}
                      disabled={actionLoading}
                    >
                      החזר ספר
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBorrow}
                      disabled={actionLoading}
                    >
                      השאל ספר
                    </button>
                  )}

                  <button type="button" onClick={handleFavorite}>
                    {isFavorite ? "❤️ במועדפים" : "♡ הוסף למועדפים"}
                  </button>
                </div>
              )}
            </>
          )}

          {error && <p className="borrow-error">{error}</p>}
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSuccessModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✅</div>
            <h2 className="modal-title">הספר עודכן בהצלחה</h2>
            <button
              className="modal-btn confirm"
              onClick={() => setShowSuccessModal(false)}
            >
              סגור
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
