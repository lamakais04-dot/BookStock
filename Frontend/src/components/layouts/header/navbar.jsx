import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../csspages/navbar.css";
import logo from "../../../../BookstockLogo.png";
import LoginClass from "../../services/login";

export default function Navbar() {
  const { user, loading, setUser } = useAuth();
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === "admin";
  const isFavoritePage = location.pathname === "/favorites";

  /* ניקוי חיפוש כשעוזבים את עמוד הספרים */
  useEffect(() => {
    if (location.pathname !== "/book") {
      setSearch("");
    }
  }, [location.pathname]);

  if (loading) return null;

  const handleLogout = () => {
    setUser(null);
    LoginClass.handleLogout();
    navigate("/login");
    window.location.reload();
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    navigate(`/book?search=${encodeURIComponent(value)}`);
  };

  const clearSearch = () => {
    setSearch("");
    navigate("/book");
  };

  const handleFavoriteClick = () => {
    navigate("/favorites");
  };

  return (
    <nav className="navbar">
      {/* ===== RIGHT ===== */}
      <div className="navbar-right">
        <NavLink to="/">
          <img className="navbar-logo" src={logo} alt="logo" />
        </NavLink>

        <NavLink to="/book">כל הספרים</NavLink>

        {/* 🕘 Admin – פעילויות אחרונות */}
        {isAdmin && (
          <NavLink to="/admin/activity" className="admin-nav-link">
            🕘 פעילויות אחרונות
          </NavLink>
        )}

        {/* 🔧 Admin – ניהול מערכת */}
        {isAdmin && (
          <NavLink to="/profile#admin" className="admin-nav-link">
            🔧 ניהול מערכת
          </NavLink>
        )}
      </div>

      {/* ===== SEARCH ===== */}
      <div className="navbar-search">
        <input
          type="text"
          placeholder="חיפוש ספר..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {search && (
          <button
            className="clear-search"
            onClick={clearSearch}
            title="נקה חיפוש"
          >
            ×
          </button>
        )}
      </div>

      {/* ===== LEFT ===== */}
      <div className="navbar-left">
        {user ? (
          <>
            {/* ❤️ FAVORITES – רק למשתמש רגיל */}
            {!isAdmin && (
              <div
                className={`nav-icon heart ${isFavoritePage ? "filled" : ""}`}
                title="מועדפים"
                onClick={handleFavoriteClick}
              >
                <svg viewBox="0 0 24 24" className="heart-svg">
                  <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
                </svg>
              </div>
            )}

            {/* PROFILE */}
            <div className="profile-icon-wrapper">
              <div
                className={`nav-icon profile ${isAdmin ? "admin-border" : ""}`}
                onClick={() => setOpenProfileMenu(!openProfileMenu)}
              >
                {isAdmin && <span className="admin-crown">👑</span>}
                <img
                  src={user?.image || "/profilelogo.svg"}
                  alt="profile"
                  className="profile-icon-img"
                />
              </div>

              {openProfileMenu && (
                <div className="profile-dropdown">
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/profile");
                      setOpenProfileMenu(false);
                    }}
                  >
                    הפרופיל שלי
                  </div>

                  {isAdmin && (
                    <div
                      className="dropdown-item admin-only"
                      onClick={() => {
                        navigate("/profile#admin");
                        setOpenProfileMenu(false);
                      }}
                    >
                      ניהול מערכת
                    </div>
                  )}

                  <div
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    התנתקות
                  </div>
                </div>
              )}
            </div>

            <label className="welcome">
              שלום, {user.firstname}! {isAdmin && <small>(Admin)</small>}
            </label>
          </>
        ) : (
          <>
            <NavLink to="/login">התחברות</NavLink>
            <NavLink to="/signup">הרשמה</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}