import { useNavigate } from "react-router-dom";
import logo from "/logo.png";

function Navbar({ role, setUserRole }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Clear session storage completely
    sessionStorage.removeItem("role");
    sessionStorage.clear();

    // 2. Clear state if handler is passed
    if (setUserRole) {
      setUserRole(null);
    }

    // 3. Navigate to login using replacement so user can't hit back button into dashboard
    navigate("/login", { replace: true });
  };

  return (
    <nav className="dashboard-navbar">
      <a href="/" className="logo">
        <img src={logo} alt="logo" />
        TruckLoad Hub
      </a>

      <div className="navbar-title"> {role} DASHBOARD </div>

      <div className="navbar-right">
        <button type="button" onClick={handleLogout} className="logout-button">
          Logout{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width="16"
            height="16"
            fill="currentColor"
          >
            <path d="M160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0zM502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
          </svg>
        </button>
      </div>

      <style>{`
        .dashboard-navbar {
          height: 70px;
          padding: 0 30px;
          background: #fff;
          border-bottom: 1px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 1000;
          zoom:90%;
        }
        .navbar-title {
          display: flex;
          align-items: center;
          font-weight: bold;
          font-size: 24px;
        }
        .navbar-right {
          display: flex;
          align-items: center;
          font-weight: bold;
        }
        .logo {
          font-size: 22px;
          font-weight: bold;
          display: flex;
          flex-direction: row;
          align-items: center;
          color: #222;
          text-decoration: none;
        }
        .logo img { 
          width: 60px;
          height: 60px;
        }
        .logout-button {
          padding: 8px 15px;
          border: 1px solid #222;
          border-radius: 6px;
          font-size: 14px;
          background: #222;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }
        .logout-button svg {
          display: block;
        }
        .logout-button:hover {
          background: #666;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
