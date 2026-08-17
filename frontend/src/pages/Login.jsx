import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/logo.png";
import { api } from "../api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      alert("Login successfully!");

      const user = data.user;

      switch (user?.role) {
        case "DRIVER":
          navigate("/driver");
          break;
        case "LOADER":
          navigate("/loader");
          break;
        case "ADMIN":
          navigate("/admin");
          break;
        default:
          alert("Invalid user role");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Unable to connect to server");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">
          <img src={logo} alt="logo" />
          <h1>TruckLoad Hub</h1>
        </div>

        <h2>Login</h2>
        <p>Login to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="primary-button">
            Login
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </div>

      <style>{`
        .auth-page {
          max-width: 1300px;
          margin: 0 auto;
          height: 100vh;
          padding-right: 100px;
          justify-content: flex-end;
          display: flex;
          align-items: center;
          background: url('https://i.postimg.cc/SsTQDQY8/image.png') no-repeat center center / cover;
          box-sizing: border-box;
          overflow: hidden;
        }

        .auth-card {
          width: 100%;
          max-width: 450px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 30px 40px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          border-radius: 16px;
          box-sizing: border-box;
        }

        .logo {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background-color: rgba(255, 255, 255, 0.8);
          border: 1px solid black;
          padding: 8px 10px;
          gap: 10px;
          margin-bottom: 5px;
        }

        .auth-card img {
          width: 55px;
          height: 55px;
          background: inherit;
          border-radius: 50%;
        }

        .auth-card h1 {
          color: rgba(0, 0, 0);
          text-align: center;
          font-size: 22px;
        }

        .auth-card h2 {
          color: #0082d8;
          text-align: center;
          margin-top: 15px;
        }

        .auth-card > p {
          text-align: center;
          color: #d3d1d1;
          margin-bottom: 15px;
        }

        .form-group {
          margin-bottom: 15px;
          color: #d3d1d1;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 6px;
          font-size: 12px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #222;
          background: rgba(255, 255, 255, 0.85);
        }

        .primary-button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: #298ce2;
          color: #ffffff;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          margin-top: 10px;
        }

        .primary-button:hover {
          background: #60a8cc;
          color: #051329;
        }

        .auth-link {
          margin-top: 15px;
          text-align: center;
        }

        .auth-link a {
          color: #9c9393;
          font-weight: 600;
          text-decoration: none;
        }

        .auth-link a:hover {
          color: #c8c6c6;
          text-decoration: underline;
        }

        .back-link {
          display: block;
          text-align: center;
          margin-top: 10px;
          color: #d3d1d1;
          text-decoration: none;
        }

        .back-link:hover {
          text-decoration: underline;
          color: #9c9393;
        }

        .auth-card::-webkit-scrollbar {
          width: 6px;
        }
        .auth-card::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .auth-card::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default Login;
