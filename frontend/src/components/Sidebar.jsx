import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ role }) {
  const navigate = useNavigate();

  // Retrieve user details from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const name = user.name || user.fullName || "User";
  const email = user.email || user.gmail || "user@example.com";
  const userId = user.id || user._id || user.userId || "1042";
  const userRole = role || user.role || "USER";

  // Generate 2-letter initials
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const adminLinks = [
    { name: "User Verification", path: "/admin/verification" },
    { name: "Drivers", path: "/admin/drivers" },
    { name: "Loaders", path: "/admin/loaders" },
    { name: "Queries", path: "/admin/contacts" }
  ];

  const driverLinks = [
    { name: "Available Loads", path: "/driver/available-loads" },
    { name: "My Deals", path: "/driver/deals" }
  ];

  const loaderLinks = [
    { name: "Manage Loads", path: "/loader/manage-loads" },
    { name: "Load Deals", path: "/loader/deals" }
  ];

  let links = [];
  if (role === "ADMIN") links = adminLinks;
  if (role === "DRIVER") links = driverLinks;
  if (role === "LOADER") links = loaderLinks;

  return (
    <aside className="dashboard-sidebar">
      {/* NAVIGATION LINKS */}
      <div className="sidebar-top">
        <div className="sidebar-title">Welcome, {name}</div>

        <nav className="sidebar-links">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="link-text">{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* MATCHING EXISTING SIDEBAR UI COLOURS */}
      <div className="sidebar-bottom">
        <div className="profile-badge">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <div className="profile-name">{name}</div>
            <div className="profile-email">{email}</div>
            <div className="profile-tag">
              <span className="role-text">{userRole}</span> • ID: {userId}
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <svg className="logout-icon" viewBox="0 0 512 512" fill="currentColor">
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>

      <style>{`
        .dashboard-sidebar {
          width: 240px;
          background: #fff;
          border-right: 1px solid #ddd;
          padding: 20px 15px;
          flex-shrink: 0;
          position: sticky;
          top: 70px;
          height: calc(100vh - 70px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .sidebar-top {
          display: flex;
          flex-direction: column;
        }

        .sidebar-title {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          color: #fff;
          padding: 10px 12px;
          margin-bottom: 20px;
          background: #605f5f;
          border-radius: 6px;
        }

        .sidebar-links {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: #444;
          font-size: 15px;
          font-weight: bold;
          transition: background 0.2s;
        }

        .sidebar-link:hover {
          background: #f2f2f2;
        }

        .sidebar-link.active {
          background: #222;
          color: #fff;
        }

        /* BOTTOM SECTION */
        .sidebar-bottom {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        /* PROFILE BADGE MATCHING UI */
        .profile-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: #f2f2f2;
          border: 1px solid #ddd;
          border-radius: 6px;
        }

        .profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #605f5f;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 13px;
          flex-shrink: 0;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .profile-name {
          font-size: 13px;
          font-weight: bold;
          color: #222;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-email {
          font-size: 11px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-tag {
          font-size: 10px;
          color: #888;
          margin-top: 1px;
        }

        .role-text {
          color: #222;
          font-weight: bold;
        }

        /* LOGOUT BUTTON MATCHING UI */
        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          background: #605f5f;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: #222222;
        }

        .logout-icon {
          width: 15px;
          height: 15px;
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
