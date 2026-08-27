import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ role }) {
  const navigate = useNavigate();


  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const name = user.name || user.fullName || "User";
  const email = user.email || user.gmail || "user@example.com";
  const userId = user.id || user._id || user.userId || "1042";
  const userRole = role || user.role || "USER";

  // Generate 2-letter initials
  const initials = name.split(" ") .map((word) => word[0]).join("").toUpperCase().slice(0, 2);

 
  const adminLinks = [
    {
      name: "User Verification",
      path: "/admin/verification",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20" fill="currentColor">
          <path d="M286 304c98.5 0 178.3 79.8 178.3 178.3 0 16.4-13.3 29.7-29.7 29.7L78 512c-16.4 0-29.7-13.3-29.7-29.7 0-98.5 79.8-178.3 178.3-178.3l59.4 0zM585.7 105.9c7.8-10.7 22.8-13.1 33.5-5.3s13.1 22.8 5.3 33.5L522.1 274.9c-4.2 5.7-10.7 9.4-17.7 9.8s-14-2.2-18.9-7.3l-46.4-48c-9.2-9.5-9-24.7 .6-33.9 9.5-9.2 24.7-8.9 33.9 .6l26.5 27.4 85.6-117.7zM256.3 248a120 120 0 1 1 0-240 120 120 0 1 1 0 240z"/>
        </svg>
      )
    },
    {
      name: "Drivers",
      path: "/admin/drivers",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20" fill="currentColor">
          <path d="M0 96C0 60.7 28.7 32 64 32l448 0c35.3 0 64 28.7 64 64L0 96zm0 48l576 0 0 272c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 144zM247.3 416c20.2 0 35.3-19.4 22.4-35-14.7-17.7-36.9-29-61.7-29l-64 0c-24.8 0-47 11.3-61.7 29-12.9 15.6 2.2 35 22.4 35l142.5 0zM176 312a56 56 0 1 0 0-112 56 56 0 1 0 0 112zM360 208c-13.3 0-24 10.7-24 24s10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-112 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-112 0z"/>
        </svg>
      )
    },
    {
      name: "Loaders",
      path: "/admin/loaders",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20" fill="currentColor">
          <path d="M32 0C14.3 0 0 14.3 0 32S14.3 64 32 64l16 0c8.8 0 16 7.2 16 16l0 288c0 39.8 29.1 72.8 67.1 79-2 5.3-3.1 11-3.1 17 0 26.5 21.5 48 48 48s48-21.5 48-48c0-5.6-1-11-2.7-16l197.5 0c-1.8 5-2.7 10.4-2.7 16 0 26.5 21.5 48 48 48s48-21.5 48-48c0-5.6-1-11-2.7-16l34.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-400 0c-8.8 0-16-7.2-16-16l0-288C128 35.8 92.2 0 48 0L32 0zM224 64c-26.5 0-48 21.5-48 48l0 176c0 26.5 21.5 48 48 48l240 0c26.5 0 48-21.5 48-48l0-176c0-26.5-21.5-48-48-48L224 64z"/>
        </svg>
      )
    },
    {
      name: "Queries",
      path: "/admin/contacts",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20" fill="currentColor">
          <path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm0-336c-17.7 0-32 14.3-32 32 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-44.2 35.8-80 80-80s80 35.8 80 80c0 47.2-36 67.2-56 74.5l0 3.8c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-8.1c0-20.5 14.8-35.2 30.1-40.2 6.4-2.1 13.2-5.5 18.2-10.3 4.3-4.2 7.7-10 7.7-19.6 0-17.7-14.3-32-32-32zM224 368a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
        </svg>
      )
    }
  ];

  const driverLinks = [
    {
      name: "Available Loads",
      path: "/driver/available-loads",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="20" height="20" fill="currentColor">
          <path d="M32 0C14.3 0 0 14.3 0 32S14.3 64 32 64l72.9 0 92.1 276.2c-22.5 17.6-37 45-37 75.8 0 53 43 96 96 96 52.4 0 95.1-42 96-94.3l202.1-67.4c16.8-5.6 25.8-23.7 20.2-40.5s-23.7-25.8-40.5-20.2L331.8 357c-17.2-22.1-43.9-36.5-74-37L165.7 43.8C156.9 17.6 132.5 0 104.9 0L32 0zM208 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM280.5 89.3c-25.2 8.2-39 35.3-30.8 60.5l39.6 121.7c8.2 25.2 35.3 39 60.5 30.8l121.7-39.6c25.2-8.2 39-35.3 30.8-60.5L462.8 80.5c-8.2-25.2-35.3-39-60.5-30.8L280.5 89.3z"/>
        </svg>
      )
    },
    {
      name: "My Deals",
      path: "/driver/deals",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20" fill="currentColor">
          <path d="M268.9 85.2L152.3 214.8c-4.6 5.1-4.4 13 .5 17.9 30.5 30.5 80 30.5 110.5 0l31.8-31.8c4.2-4.2 9.5-6.5 14.9-6.9 6.8-.6 13.8 1.7 19 6.9L505.6 376 576 320 576 32 464 96 440.2 80.1C424.4 69.6 405.9 64 386.9 64l-70.4 0c-1.1 0-2.3 0-3.4 .1-16.9 .9-32.8 8.5-44.2 21.1zM116.6 182.7L223.4 64 183.8 64c-25.5 0-49.9 10.1-67.9 28.1L112 96 0 32 0 320 156.4 450.3c23 19.2 52 29.7 81.9 29.7l15.7 0-7-7c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l41 41 9 0c19.1 0 37.8-4.3 54.8-12.3L359 441c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l32 32 17.5-17.5c8.9-8.9 11.5-21.8 7.6-33.1l-137.9-136.8-14.9 14.9c-49.3 49.3-129.1 49.3-178.4 0-23-23-23.9-59.9-2.2-84z"/>
        </svg>
      )
    }
  ];

  const loaderLinks = [
    {
      name: "Manage Loads",
      path: "/loader/manage-loads",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="20" height="20" fill="currentColor">
          <path d="M32 0C14.3 0 0 14.3 0 32S14.3 64 32 64l72.9 0 92.1 276.2c-22.5 17.6-37 45-37 75.8 0 53 43 96 96 96 52.4 0 95.1-42 96-94.3l202.1-67.4c16.8-5.6 25.8-23.7 20.2-40.5s-23.7-25.8-40.5-20.2L331.8 357c-17.2-22.1-43.9-36.5-74-37L165.7 43.8C156.9 17.6 132.5 0 104.9 0L32 0zM208 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM280.5 89.3c-25.2 8.2-39 35.3-30.8 60.5l39.6 121.7c8.2 25.2 35.3 39 60.5 30.8l121.7-39.6c25.2-8.2 39-35.3 30.8-60.5L462.8 80.5c-8.2-25.2-35.3-39-60.5-30.8L280.5 89.3z"/>
        </svg>
      )
    },
    {
      name: "Load Deals",
      path: "/loader/deals",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20" fill="currentColor">
          <path d="M268.9 85.2L152.3 214.8c-4.6 5.1-4.4 13 .5 17.9 30.5 30.5 80 30.5 110.5 0l31.8-31.8c4.2-4.2 9.5-6.5 14.9-6.9 6.8-.6 13.8 1.7 19 6.9L505.6 376 576 320 576 32 464 96 440.2 80.1C424.4 69.6 405.9 64 386.9 64l-70.4 0c-1.1 0-2.3 0-3.4 .1-16.9 .9-32.8 8.5-44.2 21.1zM116.6 182.7L223.4 64 183.8 64c-25.5 0-49.9 10.1-67.9 28.1L112 96 0 32 0 320 156.4 450.3c23 19.2 52 29.7 81.9 29.7l15.7 0-7-7c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l41 41 9 0c19.1 0 37.8-4.3 54.8-12.3L359 441c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l32 32 17.5-17.5c8.9-8.9 11.5-21.8 7.6-33.1l-137.9-136.8-14.9 14.9c-49.3 49.3-129.1 49.3-178.4 0-23-23-23.9-59.9-2.2-84z"/>
        </svg>
      )
    }
  ];

  let links = [];
  if (role === "ADMIN") links = adminLinks;
  if (role === "DRIVER") links = driverLinks;
  if (role === "LOADER") links = loaderLinks;

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-title">Welcome, {name}</div>

        <nav className="sidebar-links">
          {links.map((link) => (
            <NavLink key={link.path}  to={link.path}  className={({ isActive }) =>   isActive ? "sidebar-link active" : "sidebar-link"}>
              {link.icon && <span className="link-icon">{link.icon}</span>}
              <span className="link-text">{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>


      <div className="sidebar-bottom">
        <div className="profile-badge">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
              <div className="profile-tag">
              <span className="role-text">{userRole} • User ID: </span> #{userId}
            </div>
         
            <div className="profile-name">{name}</div>
            <div className="profile-email">{email}</div>
          
          </div>
        </div>
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
          gap: 12px;
          padding: 10px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: #444;
          font-size: 15px;
          font-weight: bold;
          transition: background 0.2s;
        }

        .link-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
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

        /* PROFILE BADGE */
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
          font-size: 12px;
          font-weight:700;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-tag {
          font-size: 11px;
          color: #888;
          font-weight:800;
          margin-top: 1px;
          border-bottom:1px solid black;
          padding-bottom:2px;
        }

        .role-text {
          color: #222;
          font-weight: bold;
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
