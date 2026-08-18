import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../api"; // Central API configuration import

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      alert("Name must be at least 2 characters long.");
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (formData.phone.trim() && !phoneRegex.test(formData.phone.trim())) {
      alert("Phone number must be exactly 10 digits.");
      return false;
    }

    if (!formData.message.trim()) {
      alert("Please enter your query message.");
      return false;
    }
    if (formData.message.trim().length < 10) {
      alert("Query message must be at least 10 characters long.");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 10) return;
      setFormData({ ...formData, phone: digitsOnly });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
      phone: formData.phone.trim() === "" ? null : formData.phone.trim(),
    };

    try {
      // Dynamic request using the central API_URL
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to submit query");
      }

      alert("Your query has been submitted successfully!");

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Contact Us</h1>
        <p>Have a question or need help? Send us a message.</p>

       <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" maxLength={50} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email"  maxLength={50} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter 10 digit phone number" maxLength="10" />
          </div>
          <div className="form-group">
            <label htmlFor="message">Your Query</label>
            <textarea id="message" name="message" rows="4" value={formData.message} onChange={handleChange} placeholder="Enter your query..." maxLength={100} required /></div>
          <button type="submit" className="primary-button" disabled={loading}>{loading ? "Sending..." : "Send Message"}</button>
        </form>

        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </div>
      <style>{`
        .auth-page {
          width:100%;
          margin: 0 auto;
          height: 100vh;
          padding-left: 100px;
          justify-content: flex-start;
          display: flex;
          align-items: center;
          background: url('/cont.png') no-repeat center center / cover;
          box-sizing: border-box;
          overflow: hidden;
        }

        .auth-card {
          width: 100%;
          max-width: 500px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 15px 40px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          border-radius: 16px;
          box-sizing: border-box;
        }

        .auth-card h1 {
          color: #0082d8;
          text-align: center;
          font-size: 30px;
          margin-bottom: 5px;
        }

        .auth-card > p {
          text-align: center;
          color: #d3d1d1;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .form-group {
          margin-bottom: 10px;
          color: #d3d1d1;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 6px;
          font-size: 12px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #222;
          background: rgba(255, 255, 255, 0.85);
        }

        .primary-button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background-color: #0082d8; color: #ffffff;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          margin-top: 10px;
        }

        .primary-button:hover:not(:disabled) {
          background: #60a8cc; color: #051329;
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .back-link {
          display: block;
          text-align: center;
          margin-top: 15px;
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
    </section>
  );
}

export default Contact;
