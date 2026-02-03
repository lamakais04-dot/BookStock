import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Library from "../services/library";
import Login from "../services/login";
import "../csspages/profile.css";
import BookItem from "./BookItem";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [books, setBooks] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const { fetchUser, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = user?.role === "admin";

    /* ===== Load profile + books ===== */
    useEffect(() => {
        async function loadData() {
            const p = await Login.getProfile();
            setProfile(p);

            if (!isAdmin) {
                const b = await Library.getMyBooks();
                setBooks(b);
            }
        }
        loadData();
    }, [isAdmin]);

    /* ===== SCROLL TO ADMIN (AFTER RENDER) ===== */
    useEffect(() => {
        if (location.hash === "#admin" && isAdmin && profile) {
            const el = document.getElementById("admin");
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }, 250);
            }
        }
    }, [location.hash, isAdmin, profile]);

    if (!profile) {
        return <div className="profile-loading">טוען...</div>;
    }

    return (
        <div className="profile-page-wrapper">

            {/* 🔙 BACK */}
            <button
                className="profile-back-btn"
                onClick={() => navigate(-1)}
            >
                ← חזרה
            </button>

            {/* ===== FLOATING BOOKS ===== */}
            <div className="floating-books">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className={`floating-book fb-${i + 1}`}
                    >
                        📚
                    </div>
                ))}
            </div>

            <div className="profile-page">

                {/* ===== PROFILE CARD ===== */}
                <div className="profile-card">

                    {/* AVATAR */}
                    <div className="profile-avatar">
                        <img
                            src={profile.image || "/profilelogo.svg"}
                            alt="profile"
                            className={`profile-avatar-img ${isAdmin ? "admin-avatar" : ""}`}
                        />

                        {isAdmin && (
                            <div className="admin-badge-label">
                                מנהל מערכת
                            </div>
                        )}

                        <label className="upload-btn">
                            החלף תמונה
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append("image_file", file);

                                    try {
                                        const res = await Login.uploadImage(formData);
                                        setProfile(prev => ({
                                            ...prev,
                                            image: res.image
                                        }));
                                        fetchUser();
                                    } catch {
                                        console.log("שגיאה בהעלאת תמונה");
                                    }
                                }}
                            />
                        </label>
                    </div>

                    {/* DETAILS */}
                    <div className="profile-details">
                        <h1>{isAdmin ? "פרופיל מנהל" : "הפרופיל שלי"}</h1>

                        <div className="profile-row">
                            <span>שם פרטי:</span>
                            {isEditing ? (
                                <input
                                    value={profile.firstname}
                                    onChange={e =>
                                        setProfile({ ...profile, firstname: e.target.value })
                                    }
                                />
                            ) : (
                                <strong>{profile.firstname}</strong>
                            )}
                        </div>

                        <div className="profile-row">
                            <span>שם משפחה:</span>
                            {isEditing ? (
                                <input
                                    value={profile.lastname}
                                    onChange={e =>
                                        setProfile({ ...profile, lastname: e.target.value })
                                    }
                                />
                            ) : (
                                <strong>{profile.lastname}</strong>
                            )}
                        </div>

                        <div className="profile-row">
                            <span>אימייל:</span>
                            <strong>{profile.email}</strong>
                        </div>

                        <div className="profile-row">
                            <span>טלפון:</span>
                            {isEditing ? (
                                <input
                                    value={profile.phonenumber || ""}
                                    onChange={e =>
                                        setProfile({ ...profile, phonenumber: e.target.value })
                                    }
                                />
                            ) : (
                                <strong>{profile.phonenumber || "—"}</strong>
                            )}
                        </div>

                        {isEditing ? (
                            <button
                                className="save-btn"
                                onClick={async () => {
                                    const updated = await Login.updateProfile(profile);
                                    setProfile(updated);
                                    setIsEditing(false);
                                }}
                            >
                                שמור שינויים
                            </button>
                        ) : (
                            <button
                                className="edit-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                ערוך פרטים
                            </button>
                        )}
                    </div>
                </div>

                <hr className="profile-divider" />

                {/* ===== ADMIN / USER CONTENT ===== */}
                {isAdmin ? (
                    <div
                        id="admin"
                        className="admin-controls-section"
                    >
                        <h2 className="profile-section-title">
                            🛠️ ניהול מערכת
                        </h2>

                        <div className="admin-actions-grid">
                            <button
                                className="admin-action-btn"
                                onClick={() => navigate("/admin/users")}
                            >
                                👥 כל המשתמשים
                            </button>

                            <button
                                className="admin-action-btn"
                                onClick={() => navigate("/admin/categories")}
                            >
                                📂 קטגוריות
                            </button>

                            <button
                                className="admin-action-btn"
                                onClick={() => navigate("/admin/activity")}
                            >
                                📜 פעילויות אחרונות
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="profile-section-title">
                            📚 הספרים שהשאלתי
                        </h2>

                        {books.length === 0 ? (
                            <p className="profile-empty">
                                אין ספרים מושאלים
                            </p>
                        ) : (
                            <div className="profile-books-grid">
                                {books.map(book => (
                                    <BookItem
                                        key={book.id}
                                        book={book}
                                        setBooks={setBooks}
                                        mode="profile"
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
