import { useState } from "react";
import "../csspages/BookForm.css";

export default function BookForm({
  initialData = {},
  categories = [],
  ageGroups = [],
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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setForm({
      ...form,
      imageFile: e.target.files[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // כרגע – רק פרונט
    onSubmit(form);
  };

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <input
        name="title"
        placeholder="שם הספר"
        value={form.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="summary"
        placeholder="תקציר הספר"
        value={form.summary}
        onChange={handleChange}
        rows={3}
        required
      />

      <input
        name="author"
        placeholder="שם המחבר"
        value={form.author}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="pages"
        placeholder="מספר עמודים"
        value={form.pages}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="quantity"
        placeholder="כמות ספרים"
        value={form.quantity}
        onChange={handleChange}
        required
      />

      {/* ===== Category ===== */}
      <select
        name="categoryid"
        value={form.categoryid}
        onChange={handleChange}
        required
      >
        <option value="">בחר קטגוריה</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* ===== Age Group ===== */}
      <select
        name="agesid"
        value={form.agesid}
        onChange={handleChange}
        required
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
