// pages/admin/AdminUserBorrows.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Admin from "../../services/admin";
import "../../csspages/AdminUsersBorrow.css";
import { socket } from "../../services/socket";

export default function AdminUserBorrows() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [borrows, setBorrows] = useState([]);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [userName, setUserName] = useState("");

  const loadBorrows = useCallback(async () => {
    const data = await Admin.getUserBorrows(id, onlyOpen);
    setBorrows(data);
  }, [id, onlyOpen]);

  useEffect(() => {
    loadBorrows();
  }, [loadBorrows]);

  useEffect(() => {
    Admin.getUsers("").then((users) => {
      const found = users.find((u) => u.id === Number(id));
      if (found) setUserName(`${found.firstname} ${found.lastname}`);
    });
  }, [id]);

  // live updates when this user's borrows change
  useEffect(() => {
    function handleBorrowReturnChanged(data) {
      if (!data || data.user_id !== Number(id)) return;
      loadBorrows();
    }

    socket.on("borrow_return_changed", handleBorrowReturnChanged);

    return () => {
      socket.off("borrow_return_changed", handleBorrowReturnChanged);
    };
  }, [id, loadBorrows]);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openCount = borrows.filter((b) => !b.returned_at).length;
  const returnedCount = borrows.filter((b) => b.returned_at).length;

  return (
    <div className="admin-borrows-page">
      <div className="admin-borrows-container">
        {/* HEADER */}
        <div className="admin-borrows-header">
          <button className="back-btn" onClick={() => navigate("/admin/users")}>
            ← חזור
          </button>
          <h1>📚 תולדות השאולות</h1>
          {userName && (
            <p className="header-user-name">של {userName}</p>
          )}
        </div>

        {/* STATS ROW */}
        <div className="borrows-stats-row">
          <div className="borrow-stat-card">
            <div className="borrow-stat-icon">📖</div>
            <div className="borrow-stat-value">{borrows.length}</div>
            <div className="borrow-stat-label">סה"כ שאולות</div>
          </div>
          <div className="borrow-stat-card open">
            <div className="borrow-stat-icon">📕</div>
            <div className="borrow-stat-value">{openCount}</div>
            <div className="borrow-stat-label">שאולות פתוחות</div>
          </div>
          <div className="borrow-stat-card returned">
            <div className="borrow-stat-icon">📗</div>
            <div className="borrow-stat-value">{returnedCount}</div>
            <div className="borrow-stat-label">הוחזרו</div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="borrows-filter-bar">
          <div
            className={`filter-toggle ${onlyOpen ? "active" : ""}`}
            onClick={() => setOnlyOpen((prev) => !prev)}
          >
            <div className="toggle-track">
              <div className="toggle-thumb"></div>
            </div>
            <span className="filter-toggle-label">הראה רק שאולות פתוחות</span>
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="borrows-table-wrapper">
          {borrows.length === 0 ? (
            <div className="borrows-empty">
              <div className="borrows-empty-icon">📚</div>
              <div className="borrows-empty-text">
                {onlyOpen ? "אין שאולות פתוחות כעת" : "אין תולדות שאולות"}
              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <table className="borrows-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "right" }}>שם הספר</th>
                    <th>תאריך השאולה</th>
                    <th>תאריך השיבה</th>
                    <th style={{ width: "120px" }}>סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {borrows.map((b, i) => (
                    <tr key={i} className={!b.returned_at ? "open-row" : ""}>
                      <td>
                        <div className="book-cell">
                          <div
                            className={`book-icon ${
                              !b.returned_at ? "open" : "returned"
                            }`}
                          >
                            {!b.returned_at ? "📕" : "📗"}
                          </div>
                          <span className="book-title">{b.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="date-value">
                          {formatDate(b.borrowed_at)}
                        </span>
                      </td>
                      <td>
                        {b.returned_at ? (
                          <span className="date-value">
                            {formatDate(b.returned_at)}
                          </span>
                        ) : (
                          <span className="date-pending">—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            b.returned_at ? "returned" : "open"
                          }`}
                        >
                          {b.returned_at ? "✅ הוחזר" : "📕 פתוח"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* MOBILE CARD LIST */}
              <div className="borrows-card-list">
                {borrows.map((b, i) => (
                  <div
                    key={i}
                    className={`borrow-card ${
                      !b.returned_at ? "open" : ""
                    }`}
                  >
                    <div className="borrow-card-top">
                      <div
                        className={`borrow-card-icon ${
                          !b.returned_at ? "open" : "returned"
                        }`}
                      >
                        {!b.returned_at ? "📕" : "📗"}
                      </div>
                      <div className="borrow-card-info">
                        <div className="borrow-card-title">{b.title}</div>
                        <span
                          className={`status-badge ${
                            b.returned_at ? "returned" : "open"
                          }`}
                        >
                          {b.returned_at ? "✅ הוחזר" : "📕 פתוח"}
                        </span>
                      </div>
                    </div>
                    <div className="borrow-card-dates">
                      <div className="borrow-card-date-row">
                        <span className="borrow-card-date-label">שאולה:</span>
                        <span className="borrow-card-date-value">
                          {formatDate(b.borrowed_at)}
                        </span>
                      </div>
                      <div className="borrow-card-date-row">
                        <span className="borrow-card-date-label">הוחזר:</span>
                        <span
                          className={`borrow-card-date-value ${
                            !b.returned_at ? "pending" : ""
                          }`}
                        >
                          {b.returned_at ? formatDate(b.returned_at) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
