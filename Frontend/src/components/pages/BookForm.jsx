// BookForm.jsx
import { useState } from "react";

export default function BookForm({
  initialData = {},
  categories = [],
  ageGroups = [],
  onSubmit,
  mode = "create", // create | edit
  title,
  subtitle,
}) {
  const isEditMode =
    mode === "edit" || Boolean(initialData?.id);

  const [form, setForm] = useState({
    title: initialData.title || "",
    summary: initialData.summary || "",
    author: initialData.author || "",
    pages: initialData.pages || "",
    quantity: initialData.quantity || "",
    categoryid: initialData.categoryid || "",
    agesid: initialData.agesid || "",
    imageFile: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const MAX_IMAGE_MB = 5;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors.length) {
      setValidationErrors([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setForm((prev) => ({ ...prev, imageFile: null }));
      return;
    }

    const nextErrors = [];
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      nextErrors.push("קובץ תמונה חייב להיות מסוג JPG / PNG / WEBP");
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      nextErrors.push("גודל התמונה חייב להיות עד 5MB");
    }

    if (nextErrors.length > 0) {
      setValidationErrors((prev) => [...new Set([...prev, ...nextErrors])]);
      e.target.value = "";
      return;
    }

    setValidationErrors((prev) =>
      prev.filter(
        (msg) =>
          msg !== "קובץ תמונה חייב להיות מסוג JPG / PNG / WEBP" &&
          msg !== "גודל התמונה חייב להיות עד 5MB"
      )
    );

    setForm((prev) => ({
      ...prev,
      imageFile: file,
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!form.title.trim()) {
      errors.push("שם מוצר חובה");
    }

    if (!form.categoryid) {
      errors.push("קטגוריה חובה");
    }

    const qty = Number(form.quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      errors.push("כמות חייבת להיות מספר תקין ולא שלילי");
    }

    if (!form.author.trim()) {
      errors.push("שם מחבר חובה");
    }

    if (!form.summary.trim()) {
      errors.push("תקציר חובה");
    }

    const pages = Number(form.pages);
    if (!Number.isInteger(pages) || pages <= 0) {
      errors.push("מספר עמודים חייב להיות חיובי");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        author: form.author.trim(),
        summary: form.summary.trim(),
      });
    } catch (err) {
      console.error("Form submit error:", err);
      const serverDetail = err?.response?.data?.detail;
      if (typeof serverDetail === "string") {
        setValidationErrors((prev) =>
          prev.includes(serverDetail) ? prev : [...prev, serverDetail]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="book-form-shell">
      <form
        className={`book-form ${isEditMode ? "edit-mode" : "create-mode"}`}
        onSubmit={handleSubmit}
      >
        <div className="form-header">
          <h2 className="form-title">
            {title ||
              (isEditMode
                ? "עריכת ספר"
                : "הוספת ספר חדש")}
          </h2>
          <p className="form-subtitle">
            {subtitle ||
              (isEditMode
                ? "עדכן את פרטי הספר ושמור שינויים"
                : "מלא את כל הפרטים להוספת הספר לספרייה")}
          </p>
        </div>

        {validationErrors.length > 0 && (
          <div className="book-form-errors" role="alert" aria-live="polite">
            <ul>
              {validationErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="book-input-wrap">
          <input
            type="text"
            name="title"
            placeholder="שם הספר"
            value={form.title}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="book-input-wrap">
          <textarea
            name="summary"
            placeholder="תקציר הספר"
            value={form.summary}
            onChange={handleChange}
            rows={4}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="book-input-wrap">
          <input
            type="text"
            name="author"
            placeholder="שם המחבר"
            value={form.author}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="book-input-wrap">
          <input
            type="number"
            name="pages"
            placeholder="מספר עמודים"
            value={form.pages}
            onChange={handleChange}
            min="1"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="book-input-wrap">
          <input
            type="number"
            name="quantity"
            placeholder="כמות ספרים"
            value={form.quantity}
            onChange={handleChange}
            min="0"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="book-input-wrap">
          <select
            name="categoryid"
            value={form.categoryid}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            <option value="">בחר קטגוריה</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="book-input-wrap">
          <select
            name="agesid"
            value={form.agesid}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            <option value="">בחר קבוצת גיל</option>
            {ageGroups.map((age) => (
              <option key={age.id} value={age.id}>
                {age.description}
              </option>
            ))}
          </select>
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isSubmitting}
        />

        <small className="book-form-image-hint">
          העלאת תמונה אופציונלית (JPG/PNG/WEBP, עד 5MB)
        </small>

        {form.imageFile && <p>{form.imageFile.name}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "שומר..."
            : isEditMode
            ? "שמור שינויים"
            : "שמור ספר"}
        </button>
      </form>
    </div>
  );
}
