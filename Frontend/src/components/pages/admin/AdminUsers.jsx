// pages/admin/AdminUsers.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Admin from "../../services/admin";
import "../../csspages/AdminUsers.css";
import { socket } from "../../services/socket";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ userId: null, isBlocked: false, userName: "" });
  const [resultModal, setResultModal] = useState({ show: false, text: "", success: true });
  const navigate = useNavigate();

  /* ================= LOAD USERS ================= */
  const load = useCallback(async () => {
    const data = await Admin.getUsers(q);
    setUsers(data);
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  /* ================= SOCKET LIVE UPDATE ================= */
  useEffect(() => {
    function handleUsersChanged() {
      load();
    }

    socket.on("users_changed", handleUsersChanged);

    return () => {
      socket.off("users_changed", handleUsersChanged);
    };
  }, [load]);

  /* ================= OPEN MODAL ================= */
  const openModal = (userId, isBlocked, userName) => {
    setModalData({ userId, isBlocked, userName });
    setShowModal(true);
  };

  const handleBlockActionClick = (e, userItem) => {
    e.preventDefault();
    e.stopPropagation();
    openModal(
      userItem.id,
      userItem.is_blocked,
      `${userItem.firstname} ${userItem.lastname}`
    );
  };

  /* ================= CLOSE MODAL ================= */
  const closeModal = () => {
    setShowModal(false);
    setModalData({ userId: null, isBlocked: false, userName: "" });
  };

  /* ================= CONFIRM BLOCK / UNBLOCK ================= */
  const confirmToggleBlock = async () => {
    const { userId } = modalData;

    try {
      const res = await Admin.toggleUserBlock(userId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_blocked: res.is_blocked } : u
        )
      );

      const resultText = res.is_blocked
        ? "🚫 המשתמש נחסם בהצלחה"
        : "✅ החסימה בוטלה בהצלחה";
      setResultModal({ show: true, text: resultText, success: true });
    } catch {
      const resultText = "❌ שגיאה בעדכון סטטוס המשתמש";
      setResultModal({ show: true, text: resultText, success: false });
    }
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
            חסימה, שחרור ומעקב אחרי משתמשים
          </p>
        </div>

        {/* SEARCH */}
        <div className="admin-users-search-wrapper">
          <div className="admin-users-search-row">
            <span>🔍</span>
            <input
              className="admin-users-search"
              placeholder="חיפוש לפי שם / אימייל"
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
                <th>שם</th>
                <th>אימייל</th>
                <th>תפקיד</th>
                <th>שאולים כעת</th>
                <th>סה״כ שאולים</th>
                <th>פעולות</th>
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

                  <td>{u.email}</td>

                  <td>
                    <span className={`role-badge ${u.role?.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>

                  <td>{u.borrowed_now_count}</td>
                  <td>{u.total_borrows}</td>

                  <td>
                    <div className="user-actions">
                      <button
                        type="button"
                        className="user-action-btn view"
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                      >
                        👁️ פרטים
                      </button>

                      <button
                        type="button"
                        className={`user-action-btn ${
                          u.is_blocked ? "unblock" : "block"
                        }`}
                        onClick={(e) => handleBlockActionClick(e, u)}
                      >
                        {u.is_blocked ? "✅ ביטול חסימה" : "🚫 חסום"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              {modalData.isBlocked ? "✅" : "🚫"}
            </div>
            
            <h2 className="modal-title">
              {modalData.isBlocked ? "ביטול חסימת משתמש" : "חסימת משתמש"}
            </h2>
            
            <p className="modal-text">
              {modalData.isBlocked 
                ? `האם את בטוחה שברצונך לבטל את החסימה של ${modalData.userName}?`
                : `האם את בטוחה שברצונך לחסום את ${modalData.userName}?`
              }
            </p>

            <div className="modal-buttons">
              <button 
                type="button"
                className="modal-btn cancel"
                onClick={closeModal}
              >
                ביטול
              </button>
              <button 
                type="button"
                className={`modal-btn confirm ${modalData.isBlocked ? "unblock" : "block"}`}
                onClick={confirmToggleBlock}
              >
                {modalData.isBlocked ? "✅ בטל חסימה" : "🚫 חסום משתמש"}
              </button>
            </div>
          </div>
        </div>
      )}

      {resultModal.show && (
        <div
          className="modal-overlay"
          onClick={() => setResultModal((prev) => ({ ...prev, show: false }))}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">{resultModal.success ? "✅" : "⚠️"}</div>
            <h2 className="modal-title">{resultModal.success ? "עודכן בהצלחה" : "שגיאה"}</h2>
            <p className="modal-text">{resultModal.text}</p>
            <div className="modal-buttons">
              <button
                type="button"
                className="modal-btn confirm"
                onClick={() => setResultModal((prev) => ({ ...prev, show: false }))}
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
