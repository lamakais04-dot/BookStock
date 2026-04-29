// pages/admin/AdminActivity.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminService from "../../services/admin";
import { downloadBlob } from "../../../../utils/downloadHelper";
import "../../csspages/AdminActivity.css";
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
    console.log("borrow_return_changed event:", data);  // <‑‑ log here
        if (data){
            console.log("data",data)
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

  //print
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

          <h1>🕘 פעילות אחרונה (השאלה / החזרה)</h1>
        </div>

        {/* FILTERS */}
        <div className="admin-activity-filters">
          <div className="filters-row">
            <select value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="ALL">הכל</option>
              <option value="BORROW">השאלות</option>
              <option value="RETURN">החזרות</option>
            </select>

            <button onClick={handleExcel}>📤 Export Excel</button>
            <button onClick={handlePdf}>📄 Export PDF</button>
            <button onClick={handlePrint}>🖨️ Print</button>
          </div>
        </div>

        <hr className="admin-activity-divider" />

        {/* LOADING / TABLE */}
        {loading ? (
          <div className="admin-activity-loading">טוען</div>
        ) : rows.length === 0 ? (
          <div className="admin-activity-empty">
            <div className="admin-activity-empty-icon">📋</div>
            <div className="admin-activity-empty-text">אין פעילות להצגה</div>
          </div>
        ) : (
          <div className="admin-activity-table-wrapper">
            <div className="admin-activity-table-scroll">
              <table className="admin-activity-table">
                <thead>
                  <tr>
                    <th>תאריך</th>
                    <th>פעולה</th>
                    <th>משתמש</th>
                    <th>ספר</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>
                        {new Date(r.date).toLocaleString("he-IL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
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
                      <td>
                        {r.firstname} {r.lastname}
                        <span style={{ color: "#8b6f47", fontSize: "13px" }}>
                          (#{r.user_id})
                        </span>
                      </td>
                      <td>
                        {r.title}
                        <span style={{ color: "#8b6f47", fontSize: "13px" }}>
                          (#{r.book_id})
                        </span>
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
