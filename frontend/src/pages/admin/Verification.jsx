import { useEffect, useState } from "react";
import { API_URL } from "../../api"; 

function Verification() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/verification`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch pending users");
      }

      setUsers(data);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      alert(error.message || "Unable to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const updateStatus = async (userId, status) => {
    try {
      setUpdatingId(userId);

      const response = await fetch(`${API_URL}/admin/verification/${userId}?status=${status}`, { 
        method: "PUT", 
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update user");
      }

      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));

      alert(status === "VERIFIED" ? "User approved successfully." : "User rejected successfully.");
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.message || "Unable to update user");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="verification-page">
      <div className="page-header">
        <h1>Verification</h1>
        <p>Review and verify newly registered drivers and loaders.</p>
      </div>

      <div className="verification-card">
        <div className="card-header">
          <h2>Pending Users</h2>
          <span className="pending-count">{users.length}</span>
        </div>

        {loading && <div className="loading">Loading pending users...</div>}
        
        {!loading && users.length === 0 && (
          <div className="empty-state">
            <h3>No Pending Users</h3>
            <p>All registered users have been reviewed.</p>
          </div>
        )}

        {!loading &&
          users.map((user) => (
            <div className="user-row" key={user.id}>
              <div className="user-info">
                <div className="user-name-wrapper">
                  <span className="user-name">{user.name}</span>
                  {user.role && (
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="user-details">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
                  <p><strong>City:</strong> {user.city || "Not provided"}</p>
                  <p><strong>Registered:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Not available"}</p>
                </div>
              </div>

              <div className="actions">
                <button
                  className="approve"
                  disabled={updatingId === user.id}
                  onClick={() => updateStatus(user.id, "VERIFIED")}
                >
                  {updatingId === user.id ? "Updating..." : "Approve"}
                </button>

                <button
                  className="reject"
                  disabled={updatingId === user.id}
                  onClick={() => updateStatus(user.id, "REJECTED")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
      </div>

      <style>{`
        .verification-page {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-sizing: border-box;
        }

        .page-header {
          margin-bottom: 12px;
        }

        .page-header h1 {
          margin: 0 0 2px;
          font-size: 20px;
          font-weight: 700;
          color: #111;
        }

        .page-header p {
          margin: 0;
          color: #666;
          font-size: 12px;
        }

        .verification-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px 16px;
          box-sizing: border-box;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-header h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #111;
        }

        .pending-count {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #18181b;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
        }

        .loading {
          padding: 15px 0;
          text-align: center;
          color: #666;
          font-size: 12px;
        }

        .empty-state {
          padding: 20px 10px;
          text-align: center;
        }

        .empty-state h3 {
          margin: 0 0 4px;
          font-size: 14px;
        }

        .empty-state p {
          color: #777;
          margin: 0;
          font-size: 12px;
        }

        .user-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .user-row:last-child {
          border-bottom: none;
        }

        .user-info {
          flex: 1;
        }

        .user-name-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .user-name {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
        }

        .role-badge {
          padding: 1px 6px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .role-badge.loader {
          background: #18181b;
          color: #ffffff;
        }

        .role-badge.driver {
          background: #e5e7eb;
          color: #374151;
        }

        .user-details p {
          margin: 1px 0;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.3;
        }

        .user-details strong {
          color: #111827;
          font-weight: 600;
        }

        .actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .actions button {
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .approve {
          border: 1px solid #18181b;
          background: #18181b;
          color: #ffffff;
        }

        .reject {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #111827;
        }
      `}</style>
    </div>
  );
}

export default Verification;
