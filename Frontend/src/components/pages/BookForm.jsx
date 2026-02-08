import { useState } from "react";

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

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(form);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="שם הספר"
        value={form.title}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      />

      <textarea
        name="summary"
        placeholder="תקציר הספר"
        value={form.summary}
        onChange={handleChange}
        rows={4}
        required
        disabled={isSubmitting}
      />

      <input
        type="text"
        name="author"
        placeholder="שם המחבר"
        value={form.author}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      />

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

      <select
        name="categoryid"
        value={form.categoryid}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      >
        <option value="">בחר קטגוריה</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        name="agesid"
        value={form.agesid}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      >
        <option value="">בחר קבוצת גיל</option>
        {ageGroups.map(age => (
          <option key={age.id} value={age.id}>
            {age.description}
          </option>
        ))}
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isSubmitting}
      />

      {form.imageFile && (
        <p>{form.imageFile.name}</p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "שומר..." : "שמור ספר"}
      </button>
    </form>
  );
}