// pages/admin/AdminCategories.jsx
import React, { useEffect, useState } from "react";
import AdminCategories from "../../services/adminCategories";


export default function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await AdminCategories.getAll();
    setCategories(data);
  };

  const addCategory = async () => {
    if (!newName.trim()) return;
    await AdminCategories.add(newName);
    setNewName("");
    load();
  };

  const updateCategory = async (id, name) => {
    const newVal = prompt("New category name:", name);
    if (!newVal) return;
    await AdminCategories.update(id, newVal);
    load();
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await AdminCategories.remove(id);
    load();
  };

  return (
    <div className="admin-page">
      <h1>📂 ניהול קטגוריות</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="קטגוריה חדשה"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button onClick={addCategory}>➕ הוסף</button>
      </div>

      <ul>
        {categories.map((c) => (
          <li key={c.id} style={{ marginBottom: 10 }}>
            <strong>{c.name}</strong>{" "}
            <button onClick={() => updateCategory(c.id, c.name)}>✏️</button>{" "}
            <button onClick={() => deleteCategory(c.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
