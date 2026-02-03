// pages/admin/AdminCategories.jsx
import React, { useEffect, useState } from "react";
import AdminCategories from "../../services/adminCategories";
import "../../csspages/AdminCategory.css";

export default function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await AdminCategories.getAll();
    setCategories(data);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const addCategory = async () => {
    if (!newName.trim()) return;
    await AdminCategories.add(newName);
    setNewName("");
    load();
    showSuccess("✅ הקטגוריה נוספה בהצלחה!");
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
    setEditName("");
  };

  const updateCategory = async () => {
    if (!editName.trim()) return;
    await AdminCategories.update(editingCategory.id, editName);
    closeEditModal();
    load();
    showSuccess("✅ הקטגוריה עודכנה בהצלחה!");
  };

  const openDeleteModal = (category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
  };

  const deleteCategory = async () => {
    await AdminCategories.remove(deletingCategory.id);
    closeDeleteModal();
    load();
    showSuccess("✅ הקטגוריה נמחקה בהצלחה!");
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-container">
        
        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="success-notification">
            {successMessage}
          </div>
        )}

        {/* HEADER */}
        <div className="admin-categories-header">
          <h1>📂 ניהול קטגוריות</h1>
        </div>

        {/* ADD CATEGORY */}
        <div className="add-category-section">
          <div className="add-category-form">
            <input
              placeholder="הזן שם קטגוריה חדשה..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") addCategory();
              }}
            />
            <button className="add-category-btn" onClick={addCategory}>
              ➕ הוסף קטגוריה
            </button>
          </div>
        </div>

        {/* CATEGORIES LIST */}
        <div className="categories-list-wrapper">
          {categories.length === 0 ? (
            <div className="categories-empty">
              <div className="categories-empty-icon">📂</div>
              <div className="categories-empty-text">אין קטגוריות עדיין</div>
            </div>
          ) : (
            <ul className="categories-list">
              {categories.map((c) => (
                <li key={c.id} className="category-item">
                  <div className="category-name">{c.name}</div>
                  
                  <div className="category-actions">
                    <button 
                      className="category-btn edit" 
                      onClick={() => openEditModal(c)}
                      title="ערוך קטגוריה"
                    >
                      ✏️ עריכה
                    </button>
                    
                    <button 
                      className="category-btn delete" 
                      onClick={() => openDeleteModal(c)}
                      title="מחק קטגוריה"
                    >
                      🗑️ מחיקה
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ עריכת קטגוריה</h2>
              <button className="modal-close" onClick={closeEditModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <label className="modal-label">שם הקטגוריה:</label>
              <input
                className="modal-input"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") updateCategory();
                }}
                autoFocus
              />
            </div>
            
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={closeEditModal}>
                ביטול
              </button>
              <button className="modal-btn save" onClick={updateCategory}>
                💾 שמור שינויים
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header delete-header">
              <h2>🗑️ מחיקת קטגוריה</h2>
              <button className="modal-close" onClick={closeDeleteModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="delete-warning">
                <div className="delete-warning-icon">⚠️</div>
                <p className="delete-warning-text">
                  האם אתה בטוח שברצונך למחוק את הקטגוריה
                </p>
                <p className="delete-category-name">"{deletingCategory?.name}"</p>
                <p className="delete-warning-subtext">
                  פעולה זו לא ניתנת לביטול
                </p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={closeDeleteModal}>
                ביטול
              </button>
              <button className="modal-btn delete-confirm" onClick={deleteCategory}>
                🗑️ מחק לצמיתות
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}