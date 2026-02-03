import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Admin from "../../services/admin";
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Admin.getUsers(q).then(setUsers);
  }, [q]);

  const toggleBlock = async (userId) => {
    const res = await Admin.toggleUserBlock(userId);
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, is_blocked: res.is_blocked } : u
      )
    );
  };

  return (
    <div className="admin-page">
      <h1>👥 Users</h1>

      <input
        className="admin-search"
        placeholder="Search by name or email"
        value={q}
        onChange={e => setQ(e.target.value)}
      />

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Borrowed now</th>
            <th>Total borrows</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.id} className={u.is_blocked ? "blocked" : ""}>
              <td>{u.firstname} {u.lastname}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.borrowed_now_count}</td>
              <td>{u.total_borrows}</td>
              <td className="actions">
                <button onClick={() => navigate(`/admin/users/${u.id}`)}>
                  View
                </button>

                <button
                  className={u.is_blocked ? "unblock" : "block"}
                  onClick={() => toggleBlock(u.id)}
                >
                  {u.is_blocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
