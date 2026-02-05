// pages/admin/AdminUsers.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Admin from "../../services/admin";
import "../../csspages/AdminUsers.css";
import { socket } from "../../services/socket";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const data = await Admin.getUsers(q);
    setUsers(data);
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  // live update when any user's block status changes
  useEffect(() => {
    function handleUsersChanged() {
      load();
    }

    socket.on("users_changed", handleUsersChanged);

    return () => {
      socket.off("users_changed", handleUsersChanged);
    };
  }, [load]);

  const toggleBlock = async (userId) => {
    const res = await Admin.toggleUserBlock(userId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_blocked: res.is_blocked } : u
      )
    );
  };

  const getInitials = (first, last) =>
    `${(first || "").charAt(0).toUpperCase()}${(last || "")
      .charAt(0)
      .toUpperCase()}`;

  return (
    <div className="admin-users-page">
      <div className="admin-users-container">
        {/* HEADER */}
        <div className="admin-users-header">
          <button
            className="back-btn"
            onClick={() => navigate("/profile#admin")}
          >
            ← חזור
          </button>

          <h1>👥 ניהול משתמשים</h1>
          <p className="header-subtitle">
            ירשו, חסמו ועקבו אחר המשתמשים
          </p>
        </div>

        {/* SEARCH */}
        <div className="admin-users-search-wrapper">
          <div className="admin-users-search-row">
            <div className="search-icon-wrap">
              <span>🔍</span>
            </div>
            <input
              className="admin-users-search"
              placeholder="חפש לפי שם, אימייל..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="users-count-badge">
              👤 {users.length} משתמשים
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="admin-users-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th style={{ textAlign: "right", width: "24%" }}>שם</th>
                <th style={{ width: "24%" }}>אימייל</th>
                <th style={{ width: "11%" }}>תפקיד</th>
                <th style={{ width: "12%" }}>שאולים כעת</th>
                <th style={{ width: "12%" }}>סה\"כ שאולים</th>
                <th style={{ width: "17%" }}>פעולות</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.is_blocked ? "blocked" : ""}>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar">
                        {getInitials(u.firstname, u.lastname)}
                      </div>
                      <div>
                        <div className="user-name-text">
                          {u.firstname} {u.lastname}
                        </div>
                        {u.is_blocked && (
                          <span className="blocked-badge">🚫 חסום</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="user-email">{u.email}</td>

                  <td>
                    <span className={`role-badge ${u.role?.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="stat-value">{u.borrowed_now_count}</td>
                  <td className="stat-value">{u.total_borrows}</td>

                  <td>
                    <div className="user-actions">
                      <button
                        className="user-action-btn view"
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                      >
                        👁️ הקפה
                      </button>
                      <button
                        className={`user-action-btn ${
                          u.is_blocked ? "unblock" : "block"
                        }`}
                        onClick={() => toggleBlock(u.id)}
                      >
                        {u.is_blocked ? "✅ שחרור" : "🚫 חסום"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
