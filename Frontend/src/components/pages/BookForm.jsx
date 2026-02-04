import { useState } from "react";
import "../csspages/BookForm.css";

export default function BookForm({
  initialData = {},
  categories = [],
  ageGroups = [],
  existingBooks = [], // ⬅️ רשימת ספרים קיימים (לבדיקת כפילות)
  onSubmit
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    summary: initialData.summary || "",
    author: initialData.author || "",
    pages: initialData.pages || "",
    quantity: initialData.quantity || "",
    categoryid: initialData.categoryid || "",
    agesid: initialData.agesid || "",
    imageFile: null
  });

  const [errors, setErrors] = useState({});

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

    // ניקוי שגיאה בזמן הקלדה
    setErrors(prev => ({
      ...prev,
      [e.target.name]: ""
    }));
  };

  const handleFileChange = (e) => {
    setForm({
      ...form,
      imageFile: e.target.files[0]
    });
  };

  /* ================= VALIDATION ================= */

  const validate = () => {
    const newErrors = {};

    // שם ספר חובה
    if (!form.title.trim()) {
      newErrors.title = "שם הספר הוא שדה חובה";
    }

    // בדיקת כפילות שם
    const isDuplicate = existingBooks.some(
      b => b.title.toLowerCase() === form.title.trim().toLowerCase()
    );
    if (isDuplicate) {
      newErrors.title = "ספר עם שם זה כבר קיים";
    }

    // קטגוריה חובה
    if (!form.categoryid) {
      newErrors.categoryid = "חובה לבחור קטגוריה";
    }

    // כמות – מספר תקין ולא שלילי
    if (form.quantity === "" || isNaN(form.quantity)) {
      newErrors.quantity = "יש להזין מספר תקין";
    } else if (Number(form.quantity) < 0) {
      newErrors.quantity = "כמות לא יכולה להיות שלילית";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit(form);
  };

  /* ================= JSX ================= */

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <input
        name="title"
        placeholder="שם הספר"
        value={form.title}
        onChange={handleChange}
      />
      {errors.title && <span className="error">{errors.title}</span>}

      <textarea
        name="summary"
        placeholder="תקציר הספר"
        value={form.summary}
        onChange={handleChange}
        rows={3}
      />

      <input
        name="author"
        placeholder="שם המחבר"
        value={form.author}
        onChange={handleChange}
      />

      <input
        type="number"
        name="pages"
        placeholder="מספר עמודים"
        value={form.pages}
        onChange={handleChange}
      />

      <input
        type="number"
        name="quantity"
        placeholder="כמות ספרים"
        value={form.quantity}
        onChange={handleChange}
      />
      {errors.quantity && <span className="error">{errors.quantity}</span>}

      {/* ===== Category ===== */}
      <select
        name="categoryid"
        value={form.categoryid}
        onChange={handleChange}
      >
        <option value="">בחר קטגוריה</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      {errors.categoryid && (
        <span className="error">{errors.categoryid}</span>
      )}

      {/* ===== Age Group ===== */}
      <select
        name="agesid"
        value={form.agesid}
        onChange={handleChange}
      >
        <option value="">בחר קבוצת גיל</option>
        {ageGroups.map(age => (
          <option key={age.id} value={age.id}>
            {age.description}
          </option>
        ))}
      </select>

      {/* ===== Image Upload ===== */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {form.imageFile && (
        <p style={{ fontSize: 12 }}>
          קובץ נבחר: {form.imageFile.name}
        </p>
      )}

      <button type="submit">שמור ספר</button>
    </form>
  );
}
