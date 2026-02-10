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

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({
      ...prev,
      imageFile: e.target.files?.[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(form);
    } catch (err) {
      console.error("Form submit error:", err);
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
          accept="image/*"
          onChange={handleFileChange}
          disabled={isSubmitting}
        />

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
