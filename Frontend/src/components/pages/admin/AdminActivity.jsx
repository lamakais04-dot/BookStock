// pages/admin/AdminActivity.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminService from "../../services/admin";
import { downloadBlob } from "../../../../utils/downloadHelper";
import "../../csspages/adminActivity.css";
import { socket } from "../../services/socket";

export default function AdminActivity() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [action, setAction] = useState("ALL"); // ALL | BORROW | RETURN
  const [userId, setUserId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminService.getActivity({
        action,
        user_id: userId ? Number(userId) : undefined,
        limit: 200,
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [action, userId]);

  useEffect(() => {
    load();
  }, [load]);

  // live updates when borrow/return happens
  useEffect(() => {
    function handleBorrowReturnChanged(data) {
      console.log("borrow_return_changed event:", data);
      if (data) {
        console.log("data", data);
        load();
      }
    }

    socket.on("borrow_return_changed", handleBorrowReturnChanged);

    return () => {
      socket.off("borrow_return_changed", handleBorrowReturnChanged);
    };
  }, [load]);

  const handleExcel = async () => {
    const blob = await AdminService.exportActivityExcel({
      action,
      user_id: userId ? Number(userId) : undefined,
    });
    downloadBlob(blob, "activity.xlsx");
  };

  const handlePdf = async () => {
    const blob = await AdminService.exportActivityPdf({
      action,
      user_id: userId ? Number(userId) : undefined,
    });
    downloadBlob(blob, "activity.pdf");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-activity-page">
      <div className="admin-activity-container">
        {/* HEADER */}
        <div className="admin-activity-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← חזור
          </button>

          <h1>🕘 פעילות אחרונה</h1>
          <p className="header-subtitle">מעקב אחרי השאלות והחזרות</p>
        </div>

        {/* FILTERS */}
        <div className="admin-activity-filters">
          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label">🔍 סינון לפי פעולה</label>
              <select value={action} onChange={(e) => setAction(e.target.value)}>
                <option value="ALL">הכל</option>
                <option value="BORROW">השאלות</option>
                <option value="RETURN">החזרות</option>
              </select>
            </div>

            <div className="export-buttons">
              <button className="export-btn excel" onClick={handleExcel}>
                📤 ייצא Excel
              </button>
              <button className="export-btn pdf" onClick={handlePdf}>
                📄 ייצא PDF
              </button>
              <button className="export-btn print" onClick={handlePrint}>
                🖨️ הדפסה
              </button>
            </div>
          </div>
        </div>

        {/* LOADING / TABLE */}
        {loading ? (
          <div className="admin-activity-loading">
            <div className="spinner"></div>
            <p>טוען נתונים...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="admin-activity-empty">
            <div className="admin-activity-empty-icon">📋</div>
            <div className="admin-activity-empty-text">אין פעילות להצגה</div>
          </div>
        ) : (
          <div className="admin-activity-table-wrapper">
            <div className="table-header-info">
              <span className="total-count">📊 סה"כ {rows.length} פעולות</span>
            </div>
            
            <div className="admin-activity-table-scroll">
              <table className="admin-activity-table">
                <thead>
                  <tr>
                    <th>📅 תאריך</th>
                    <th>⚡ פעולה</th>
                    <th>👤 משתמש</th>
                    <th>📚 ספר</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td className="date-cell">
                        {new Date(r.date).toLocaleString("he-IL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <span
                          className={`activity-action ${
                            r.action === "BORROW" ? "borrow" : "return"
                          }`}
                        >
                          {r.action === "BORROW" ? "📚 השאלה" : "✅ החזרה"}
                        </span>
                      </td>
                      <td className="user-cell">
                        <div className="user-info">
                          <span className="user-name">
                            {r.firstname} {r.lastname}
                          </span>
                          <span className="user-id">#{r.user_id}</span>
                        </div>
                      </td>
                      <td className="book-cell">
                        <div className="book-info">
                          <span className="book-title">{r.title}</span>
                          <span className="book-id">#{r.book_id}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}