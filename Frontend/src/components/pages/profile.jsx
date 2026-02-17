import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Library from "../services/library";
import Login from "../services/login";
import "../csspages/profile.css";
import BookItem from "./bookitem";
import { useAuth } from "../context/AuthContext";
import { socket } from "../services/socket";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [blockedModalMessage, setBlockedModalMessage] = useState("");

  const fileInputRef = useRef(null);

  const { fetchUser, user, isBlocked } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === "admin";

  const loadBorrowedBooks = useCallback(async () => {
    if (isAdmin) {
      setBooks([]);
      return;
    }
    const b = await Library.getMyBooks();
    setBooks(b);
  }, [isAdmin]);

  /* ===== Load profile + books ===== */
  useEffect(() => {
    async function loadData() {
      const p = await Login.getProfile();
      setProfile(p);
      await loadBorrowedBooks();
    }
    loadData();
  }, [loadBorrowedBooks]);

  /* Live updates when this user borrows/returns in another tab */
  useEffect(() => {
    function handleBooksChanged(payload) {
      if (!user?.id || !payload?.userId) return;
      if (String(payload.userId) !== String(user.id)) return;

      loadBorrowedBooks();
      fetchUser({ silent: true });
    }

    socket.on("books_changed", handleBooksChanged);

    return () => {
      socket.off("books_changed", handleBooksChanged);
    };
  }, [user?.id, loadBorrowedBooks, fetchUser]);

  /* ===== Auto clear error ===== */
  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  /* ===== Scroll to admin ===== */
  useEffect(() => {
    if (location.hash === "#admin" && isAdmin && profile) {
      const el = document.getElementById("admin");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 250);
      }
    }
  }, [location.hash, isAdmin, profile]);

  if (!profile) {
    return <div className="profile-loading">טוען...</div>;
  }

  const handleImageClick = () => {
    if (isBlocked) {
      setBlockedModalMessage("החשבון שלך חסום — לא ניתן להעלות תמונה");
      return;
    }
    fileInputRef.current.click();
  };

  return (
    <div className="profile-page-wrapper">
      <button className="profile-back-btn" onClick={() => navigate("/book")}>
        ← חזרה
      </button>

      <div className="floating-books">
        {[...Array(30)].map((_, i) => (
          <div key={i} className={`floating-book fb-${i + 1}`}>
            📚
          </div>
        ))}
      </div>

      <div className="profile-page">
        {/* PROFILE CARD */}
        <div className="profile-card">
          {/* AVATAR */}
          <div className="profile-avatar">
            <img
              src={profile.image || "/profilelogo.svg"}
              alt="profile"
              className={`profile-avatar-img ${isAdmin ? "admin-avatar" : ""}`}
            />

            {isAdmin && (
              <div className="admin-badge-label">מנהל מערכת</div>
            )}

            <button
              className={`upload-btn ${isBlocked ? "blocked" : ""}`}
              onClick={handleImageClick}
              type="button"
            >
              החלף תמונה
            </button>

            <input
              ref={fileInputRef}
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
                  setProfile((prev) => ({ ...prev, image: res.image }));
                  fetchUser();
                } catch {
                  setErrorMsg("שגיאה בהעלאת תמונה");
                }
              }}
            />
          </div>

          {/* DETAILS */}
          <div className="profile-details">
            <h1>{isAdmin ? "פרופיל מנהל" : "הפרופיל שלי"}</h1>

            {isBlocked && (
              <div className="blocked-warning">
                ⚠️ החשבון שלך חסום — ניתן לצפייה בלבד
              </div>
            )}

            {errorMsg && (
              <div className="profile-error">
                {errorMsg}
              </div>
            )}

            <div className="profile-row">
              <span>שם פרטי:</span>
              {isEditing ? (
                <input
                  value={profile.firstname}
                  onChange={(e) =>
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
                  onChange={(e) =>
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
                  onChange={(e) =>
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
                  if (isBlocked) {
                    setBlockedModalMessage(
                      "החשבון שלך חסום — לא ניתן לשמור שינויים"
                    );
                    return;
                  }

                  const updated = await Login.updateProfile(profile);
                  setProfile(updated);
                  setIsEditing(false);
                  fetchUser();
                }}
              >
                שמור שינויים
              </button>
            ) : (
              <button
                className="edit-btn"
                onClick={() => {
                  if (isBlocked) {
                    setBlockedModalMessage(
                      "החשבון שלך חסום — לא ניתן לערוך פרטים"
                    );
                    return;
                  }
                  setIsEditing(true);
                }}
              >
                ערוך פרטים
              </button>
            )}
          </div>
        </div>

        <hr className="profile-divider" />

        {isAdmin ? (
          <div id="admin" className="admin-controls-section">
            <h2 className="profile-section-title">🛠️ ניהול מערכת</h2>

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
            <h2 className="profile-section-title">📚 הספרים שהשאלתי</h2>

            {books.length === 0 ? (
              <p className="profile-empty">אין ספרים מושאלים</p>
            ) : (
              <div className="profile-books-grid">
                {books.map((book) => (
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

      {blockedModalMessage && (
        <div
          className="profile-blocked-modal-overlay"
          onClick={() => setBlockedModalMessage("")}
        >
          <div
            className="profile-blocked-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-blocked-modal-icon">🚫</div>
            <h3>פעולה חסומה</h3>
            <p>{blockedModalMessage}</p>
            <button type="button" onClick={() => setBlockedModalMessage("")}>הבנתי</button>
          </div>
        </div>
      )}
    </div>
  );
}
