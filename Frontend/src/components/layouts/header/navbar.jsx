import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../csspages/navbar.css";
import logo from "../../../../BookStockLogo.png";
import LoginClass from "../../services/login";

export default function Navbar() {
  const { user, loading, setUser } = useAuth();
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const navigate = useNavigate();

  if (loading) return null;

  const handleLogout = () => {
    setUser(null);
    LoginClass.handleLogout()
    navigate("/login");
    window.location.reload()
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

      {/* LEFT */}
      <div className="navbar-left">
        {user ? (
          <>
            {/* FAVORITES */}
            <div
              className={`nav-icon heart ${favorite ? "filled" : ""}`}
              title="מועדפים"
              onClick={() => {
                setFavorite(!favorite);
                navigate("/favorites");
              }}
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
                <img
                  src="/profilelogo.svg"
                  alt="profile"
                  className="profile-icon-img"
                />
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
