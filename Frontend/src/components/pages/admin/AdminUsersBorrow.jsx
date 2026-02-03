import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Admin from "../../services/admin";

export default function AdminUserBorrows() {
  const { id } = useParams();
  const [borrows, setBorrows] = useState([]);
  const [onlyOpen, setOnlyOpen] = useState(false);

  useEffect(() => {
    Admin.getUserBorrows(id, onlyOpen).then(setBorrows);
  }, [id, onlyOpen]);

  return (
    <div className="admin-page">
      <h1>📚 Borrow history</h1>

      <label>
        <input
          type="checkbox"
          checked={onlyOpen}
          onChange={e => setOnlyOpen(e.target.checked)}
        />
        Show only currently borrowed
      </label>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Book</th>
            <th>Borrowed at</th>
            <th>Returned at</th>
          </tr>
        </thead>

        <tbody>
          {borrows.map((b, i) => (
            <tr key={i}>
              <td>{b.title}</td>
              <td>{new Date(b.borrowed_at).toLocaleString()}</td>
              <td>
                {b.returned_at
                  ? new Date(b.returned_at).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
