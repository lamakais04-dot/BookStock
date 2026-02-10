// pages/SingleBook.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Books from "../services/books";
import Filters from "../services/filtirs";
import { useAuth } from "../context/AuthContext";
import BookForm from "../components/BookForm";
import "../csspages/singleBook.css";
import "../csspages/BookForm.css";

export default function SingleBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isNew = id === "new";
  const isEditMode = searchParams.get("edit") === "true";

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

  /* ================= ADMIN ACTIONS ================= */

  const handleAddBook = async (formData) => {
    try {
      await Books.addBook(formData);
      navigate("/book");
    } catch {
      setError("שגיאה בהוספת ספר");
    }
  };

  const handleUpdateBook = async (formData) => {
    try {
      await Books.updateBook(book.id, formData);
      const updated = await Books.getBookById(book.id);
      setBook(updated);
      setSearchParams({});
      setShowSuccessModal(true);
    } catch {
      setError("שגיאה בעדכון הספר");
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
                onSubmit={handleUpdateBook}
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

              {isAdmin && (
                <button
                  type="button"
                  className="edit-toggle-button"
                  onClick={() => setSearchParams({ edit: "true" })}
                >
                  ✏️ עריכה
                </button>
              ) : (
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
