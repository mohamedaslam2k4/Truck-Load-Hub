import { useEffect, useState } from "react";
import { API_URL } from "../../api"; 


function Verification() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);


  // get pending users
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch( `${API_URL}/admin/verification`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch pending users" );
      }

      setUsers(data);
    } catch (error) {
      console.error( "Error fetching pending users:", error );

      alert( error.message || "Unable to load pending users" );
    } finally {
      setLoading(false);
    }
  };

  // load details when admin opens page
  useEffect(() => {
    fetchPendingUsers();
  }, []);


  // approve or reject user
  const updateStatus = async (userId, status) => {
    try {
      setUpdatingId(userId);

      // update status send to backend
      const response = await fetch( `${API_URL}/admin/verification/${userId}?status=${status}`,{ method: "PUT", });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update user" );
      }

      // Remove updated user from pending list
      setUsers((currentUsers) => currentUsers.filter(  (user) => user.id !== userId ));

      alert(status === "VERIFIED"   ? "User approved successfully."  : "User rejected successfully." );
    } catch (error) {
      console.error(
        "Error updating user:",
        error
      );

      alert( error.message ||  "Unable to update user"  );
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
      {loading && (<div className="loading">Loading pending users...</div>)}
      {!loading && users.length === 0 && (<div className="empty-state"><h3>No Pending Users</h3><p>All registered users have been reviewed.</p></div>)}
      {!loading && users.map((user) => (
        <div className="user-row" key={user.id}>
          <div className="user-info">

            <div className="user-name">
              <h3>{user.name}</h3>
              <span className={`role-badge ${user.role ? user.role.toLowerCase() : ""}`}>{user.role}</span>
            </div>

            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
            <p><strong>City:</strong> {user.city || "Not provided"}</p>
            <p><strong>Registered:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Not available"}</p>

          </div>
          <div className="actions">

            <button className="approve" disabled={updatingId === user.id} onClick={() => updateStatus(user.id, "VERIFIED")}>
              {updatingId === user.id ? "Updating..." : "Approve"}
            </button>

            <button className="reject" disabled={updatingId === user.id} onClick={() => updateStatus(user.id, "REJECTED")}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>

  

      <style>{`
        .verification-page {
          width: 100%;
          box-sizing: border-box;
        }

        .page-header {
          margin-bottom: 25px;
        }

        .page-header h1 {
          margin: 0 0 6px;
          font-size: 28px;
        }

        .page-header p {
          margin: 0;
          color: #666;
        }

        .verification-card {
          width: 100%;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          box-sizing: border-box;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .card-header h2 {
            margin: 0 0 5px;
            font-size: 20px;
          }


        .pending-count {
          min-width: 25px;
          height: 25px;
          padding: 0 7px;
          border-radius: 20px;

          background: #222;
          color: #fff;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 13px;
          font-weight: bold;
          box-sizing: border-box;
        }

        .loading {
          padding: 30px 0;
          text-align: center;
          color: #666;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          border-top: 1px solid #eee;
        }

        .empty-state h3 {
          margin: 0 0 8px;
        }

        .empty-state p {
          color: #777;
          margin: 0;
        }

        .user-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;

          padding: 22px 0;

          border-top: 1px solid #eee;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .user-name h3 {
          margin: 0;
          font-size: 18px;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
        }

        .role-badge.driver {
          background: #eee;
          color: #222;
        }

        .role-badge.loader {
          background: #222;
          color: #fff;
        }

        .user-info p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }

        .user-info strong {
          color: #333;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .actions button {
          padding: 9px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .approve {
          border: 1px solid #222;
          background: #222;
          color: #fff;
        }

        .approve:hover:not(:disabled) {
          background: #444;
        }

        .reject {
          border: 1px solid #ccc;
          background: #fff;
          color: #222;
        }

        .reject:hover:not(:disabled) {
          background: #eee;
        }
      `}</style>

    </div>
  );
}
export default Verification;
