import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Library from "../services/library";
import Login from "../services/login";
import "../csspages/profile.css";
import BookItem from "./BookItem";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [books, setBooks] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const { fetchUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadData() {
            const p = await Login.getProfile();
            const b = await Library.getMyBooks();
            setProfile(p);
            setBooks(b);
        }
        loadData();
    }, []);

    if (!profile) return <div className="profile-loading">טוען...</div>;

    return (
        <div className="profile-page-wrapper">

            {/* 🔙 BACK BUTTON */}
            <button
                className="profile-back-btn"
                onClick={() => navigate(-1)}
            >
                ← חזרה
            </button>

            {/* ===== FLOATING BOOKS ===== */}
            <div className="floating-books">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className={`floating-book fb-${i + 1}`}>
                        📚
                    </div>
                ))}
            </div>

            <div className="profile-page">

                {/* ===== User Card ===== */}
                <div className="profile-card">

                    {/* Avatar */}
                    <div className="profile-avatar">
                        <img
                            src={profile.image || "/profilelogo.svg"}
                            alt="profile"
                            className="profile-avatar-img"
                        />

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

                    {/* Details */}
                    <div className="profile-details">
                        <h1>הפרופיל שלי</h1>

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

                        <div className="profile-row">
                            <span>כתובת:</span>
                            {isEditing ? (
                                <input
                                    value={profile.address || ""}
                                    onChange={e =>
                                        setProfile({ ...profile, address: e.target.value })
                                    }
                                />
                            ) : (
                                <strong>{profile.address || "—"}</strong>
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

                {/* ===== Borrowed Books ===== */}
                <h2 className="profile-section-title">📚 הספרים שהשאלתי</h2>

                {books.length === 0 ? (
                    <p className="profile-empty">אין ספרים מושאלים</p>
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
            </div>
        </div>
    );
}
