import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../csspages/navbar.css";
import logo from "../../../../BookStockLogo.png";
import LoginClass from "../../services/login";

export default function Navbar() {
  const { user, loading, setUser } = useAuth();
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 בדיקה אם אנחנו בדף המועדפים
  const isFavoritesPage = location.pathname === "/favorites";

  if (loading) return null;

  const handleLogout = () => {
    setUser(null);
    LoginClass.handleLogout();
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      {/* RIGHT */}
      <div className="navbar-right">
        <NavLink to="/">
          <img className="navbar-logo" src={logo} alt="logo" />
        </NavLink>

        <NavLink to="/book">כל הספרים</NavLink>
      </div>

      {/* SEARCH – LIVE */}
      <div className="navbar-search">
        <input
          type="text"
          placeholder="חיפוש ספר..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            navigate(`/book?search=${encodeURIComponent(value)}`);
          }}
        />
      </div>

      {/* LEFT */}
      <div className="navbar-left">
        {user ? (
          <>
            {/* FAVORITES */}
            <div
              className={`nav-icon heart ${isFavoritesPage ? "filled" : ""}`}
              title="מועדפים"
              onClick={() => navigate("/favorites")}
            >
              <svg viewBox="0 0 24 24" className="heart-svg">
                <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
              </svg>
            </div>

            {/* PROFILE */}
            <div className="profile-icon-wrapper">
              <div
                className="nav-icon profile"
                onClick={() => setOpenProfileMenu(!openProfileMenu)}
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="profile"
                    className="profile-icon-img"
                  />
                ) : (
                  <img
                    src="/profilelogo.svg"
                    alt="profile"
                    className="nav-icon profile"
                  />
                )}
              </div>

              {openProfileMenu && (
                <div className="profile-dropdown">
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate(`/profile/${user.id}`);
                      setOpenProfileMenu(false);
                    }}
                  >
                    הפרופיל שלי
                  </div>

                  <div
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    התנתקות
                  </div>
                </div>
              )}
            </div>

            <label className="welcome">שלום, {user.firstname}</label>
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
