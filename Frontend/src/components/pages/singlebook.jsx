// SingleBook.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Books from "../services/books";
import Filters from "../services/filtirs";
import Favorites from "../services/favorites";
import Library from "../services/library";
import { useAuth } from "../context/AuthContext";
import BookForm from "./BookForm";
import "../csspages/singleBook.css";
import "../csspages/BookForm.css";

export default function SingleBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user, setUser, isBlocked } = useAuth();
  const isAdmin = user?.role === "admin";
  const isEditMode = searchParams.get("edit") === "true";
  const isNew = !id || location.pathname === "/book/new";

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState("");
  const [book, setBook] = useState(null);

  const isBorrowedByMe = Boolean(
    user?.borrowedBooks?.includes(Number(id))
  );

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

        if (!isNew) {
          const bookData = await Books.getBookById(id);
          setBook(bookData);
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
    try {
      await Books.addBook(formData);
      navigate("/book");
    } catch (err) {
      const serverMsg = err?.response?.data?.detail;
      setError(serverMsg || "שגיאה בהוספת ספר");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return <div className="loading-container" />;
  }

  /* ================= ADD NEW BOOK ================= */
  if (isNew && isAdmin) {
    return (
      <div className="single-book-container">
        <button className="back-button" onClick={() => navigate("/book")}>
          ← חזרה
        </button>

        <div className="single-book">
          <div className="book-details">
            <h1 className="book-title">➕ הוספת ספר חדש</h1>

            <BookForm
              categories={categories}
              ageGroups={ageGroups}
              onSubmit={handleAddBook}
              mode="create"
            />

            {error && <p className="borrow-error">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  /* ================= VIEW / EDIT BOOK ================= */
  if (!book) return null;

  return (
    <div className="single-book-container">
      <button className="back-button" onClick={() => navigate("/book")}>
        ← חזרה
      </button>

      <div className="single-book">
        <div className="book-image">
          {!isNew && (
            <img src={book.image || "/placeholder.png"} alt={book.title} />
          )}
        </div>

        <div className="book-details">
          {isAdmin && isEditMode ? (
            <>
              <h1 className="book-title">
                {isNew ? "הוסף ספר חדש" : "עריכת ספר"}
              </h1>

              <BookForm
                initialData={isNew ? {} : book}
                categories={categories}
                ageGroups={ageGroups}
                onSubmit={isNew ? handleAddBook : handleUpdateBook}
                mode={isNew ? "create" : "edit"}
              />

              {!isNew && (
                <button
                  className="cancel-button"
                  onClick={() => setSearchParams({})}
                >
                  ביטול עריכה
                </button>
              )}
            </>
          ) : (
            <>
              <h1 className="book-title">{book.title}</h1>
              <p className="book-author">{book.author}</p>

              {book.summary && (
                <p className="book-summary">{book.summary}</p>
              )}

              <div className="book-info-grid">
                <div className="info-item">
                  <div className="info-label">קטגוריה</div>
                  <div className="info-value">
                    {categories.find((c) => c.id === book.categoryid)?.name ||
                      "-"}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">טווח גילאים</div>
                  <div className="info-value">
                    {ageGroups.find((a) => a.id === book.agesid)
                      ?.description || "-"}
                  </div>
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

              {isAdmin ? (
                <button
                  type="button"
                  className="edit-toggle-button"
                  onClick={() => setSearchParams({ edit: "true" })}
                >
                  ✏️ עריכת ספר
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
    </div>
  );
}
