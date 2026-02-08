import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Books from "../services/books";
import Filters from "../services/filtirs";
import "../csspages/singleBook.css";

export default function SingleBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(
    isNew || new URLSearchParams(location.search).get("edit") === "true"
  );

  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    async function loadData() {
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

      setLoading(false);
    }
    loadData();
  }, [id, isNew]);

  /* helpers to show names instead of ids */
  const categoryName =
    categories.find((c) => String(c.id) === String(book.categoryid))?.name ||
    "";
  const ageGroupName =
    ageGroups.find((a) => String(a.id) === String(book.agesid))?.description ||
    "";

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const e = {};

    if (!book.title.trim()) e.title = "חובה להזין שם ספר";
    if (!book.author.trim()) e.author = "חובה להזין שם מחבר";
    if (!book.pages || Number(book.pages) <= 0)
      e.pages = "מספר עמודים חייב להיות גדול מ־0";
    if (!book.quantity || Number(book.quantity) <= 0)
      e.quantity = "כמות חייבת להיות גדולה מ־0";
    if (!book.categoryid) e.categoryid = "חובה לבחור קטגוריה";
    if (!book.agesid) e.agesid = "חובה לבחור טווח גילאים";

    if (imageFile) {
      const allowed = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowed.includes(imageFile.type))
        e.image = "ניתן להעלות רק JPG או PNG";
      if (imageFile.size > 5 * 1024 * 1024)
        e.image = "גודל תמונה עד 5MB";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = { ...book, image: imageFile || book.image };

    if (isNew) {
      await Books.addBook(payload);
      setShowSuccessModal(true);

      setTimeout(() => {
        navigate("/book");
      }, 2000);
    } else {
      await Books.updateBook(id, payload);
      setIsEditing(false);
    }
  };

  if (loading) return <div>טוען...</div>;

  /* ================= JSX ================= */
  return (
    <div className="single-book-container">
      <button className="back-button" onClick={() => navigate("/book")}>
        ← חזרה
      </button>

      <div className="single-book">
        {/* IMAGE + UPLOAD */}
        <div className="book-image-wrapper">
          <div className="book-image">
            <img
              src={
                imageFile
                  ? URL.createObjectURL(imageFile)
                  : book.image || "/placeholder.png"
              }
              alt={book.title || "ספר"}
            />
          </div>

          {isEditing && (
            <div className="image-upload-section">
              <div className="image-upload-input">
                <label>
                  <span className="upload-icon">📤</span>
                  <span className="upload-text">העלה תמונת ספר</span>
                  <span className="upload-hint">PNG / JPG עד 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </label>
              </div>
              {errors.image && (
                <small style={{ color: "crimson" }}>{errors.image}</small>
              )}
            </div>
          )}
        </div>

        {/* DETAILS + EDIT */}
        <div className="book-details">
          {isEditing ? (
            /* ========== EDIT / ADD MODE ========== */
            <div className="edit-form-local">
              <h2 className="edit-title">
                {isNew ? "הוספת ספר חדש" : "עריכת ספר"}
              </h2>

              <label className="form-label">שם הספר:</label>
              <input
                className="form-input"
                name="title"
                value={book.title}
                onChange={handleChange}
                placeholder="לדוגמה: הארי פוטר ואבן החכמים"
              />
              {errors.title && (
                <small style={{ color: "crimson" }}>{errors.title}</small>
              )}

              <label className="form-label">שם המחבר:</label>
              <input
                className="form-input"
                name="author"
                value={book.author}
                onChange={handleChange}
                placeholder="לדוגמה: ג'יי. קיי. רולינג"
              />
              {errors.author && (
                <small style={{ color: "crimson" }}>{errors.author}</small>
              )}

              <label className="form-label">תקציר הספר:</label>
              <textarea
                className="form-textarea"
                name="summary"
                value={book.summary}
                onChange={handleChange}
                placeholder="תיאור קצר של תוכן הספר"
              />

              <label className="form-label">מספר עמודים:</label>
              <input
                type="number"
                className="form-input"
                name="pages"
                value={book.pages}
                onChange={handleChange}
                placeholder="לדוגמה: 320"
              />
              {errors.pages && (
                <small style={{ color: "crimson" }}>{errors.pages}</small>
              )}

              <label className="form-label">כמות זמינה:</label>
              <input
                type="number"
                className="form-input"
                name="quantity"
                value={book.quantity}
                onChange={handleChange}
                placeholder="לדוגמה: 5"
              />
              {errors.quantity && (
                <small style={{ color: "crimson" }}>{errors.quantity}</small>
              )}

              <label className="form-label">קטגוריה:</label>
              <select
                className="form-select"
                name="categoryid"
                value={book.categoryid}
                onChange={handleChange}
              >
                <option value="">בחרי קטגוריה</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryid && (
                <small style={{ color: "crimson" }}>{errors.categoryid}</small>
              )}

              <label className="form-label">טווח גילאים:</label>
              <select
                className="form-select"
                name="agesid"
                value={book.agesid}
                onChange={handleChange}
              >
                <option value="">בחרי טווח גילאים</option>
                {ageGroups.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.description}
                  </option>
                ))}
              </select>
              {errors.agesid && (
                <small style={{ color: "crimson" }}>{errors.agesid}</small>
              )}

              <div className="edit-actions">
                <button className="save-button" onClick={handleSave}>
                  💾 שמור
                </button>
              </div>
            </div>
          ) : (
            /* ========== VIEW MODE ========== */
            <>
              <h1 className="book-title">{book.title}</h1>
              <p className="book-author">{book.author}</p>

              {book.summary && (
                <p className="book-summary">{book.summary}</p>
              )}

              <div className="book-info-grid">
                <div className="info-item">
                  <div className="info-label">מספר עמודים</div>
                  <div className="info-value">{book.pages}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">כמות זמינה</div>
                  <div className="info-value">{book.quantity}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">קטגוריה</div>
                  <div className="info-value">
                    {categoryName || book.categoryid || "-"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">טווח גילאים</div>
                  <div className="info-value">
                    {ageGroupName || book.agesid || "-"}
                  </div>
                </div>
              </div>

              {/* Edit button – only for admin if you have roles */}
              <button
                className="edit-toggle-button"
                onClick={() => setIsEditing(true)}
              >
                ✏️ עריכה
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon success">✓</div>
            <h3 className="modal-title">הספר נוסף בהצלחה!</h3>
            <p className="modal-message">
              הספר נוסף למערכת ויופיע ברשימת הספרים
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
