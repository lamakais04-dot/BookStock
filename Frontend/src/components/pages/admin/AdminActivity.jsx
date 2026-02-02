import React, { useEffect, useMemo, useState } from "react";
import AdminService from "../../services/admin";
import { downloadBlob } from "../../../../utils/downloadHelper";

export default function AdminActivity() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [action, setAction] = useState("ALL"); // ALL | BORROW | RETURN
  const [userId, setUserId] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await AdminService.getActivity({
          action,
          user_id: userId ? Number(userId) : undefined,
          limit: 200
        });
        setRows(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [action, userId]);

  const handleExcel = async () => {
    const blob = await AdminService.exportActivityExcel({
      action,
      user_id: userId ? Number(userId) : undefined
    });
    downloadBlob(blob, "activity.xlsx");
  };

  const handlePdf = async () => {
    const blob = await AdminService.exportActivityPdf({
      action,
      user_id: userId ? Number(userId) : undefined
    });
    downloadBlob(blob, "activity.pdf");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: 24, direction: "rtl" }}>
      <h1>🕘 פעילות אחרונה (השאלה / החזרה)</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="ALL">הכל</option>
          <option value="BORROW">השאלות</option>
          <option value="RETURN">החזרות</option>
        </select>

        <input
          placeholder="סינון לפי User ID (אופציונלי)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ width: 240 }}
        />

        <button onClick={handleExcel}>📤 Export Excel</button>
        <button onClick={handlePdf}>📄 Export PDF</button>
        <button onClick={handlePrint}>🖨️ Print</button>
      </div>

      <hr />

      {loading ? (
        <p>טוען...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: 10 }}>תאריך</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 10 }}>פעולה</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 10 }}>משתמש</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 10 }}>ספר</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                    {new Date(r.date).toLocaleString()}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                    {r.action === "BORROW" ? "📚 השאלה" : "✅ החזרה"}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                    {r.firstname} {r.lastname} (#{r.user_id})
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                    {r.title} (#{r.book_id})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
