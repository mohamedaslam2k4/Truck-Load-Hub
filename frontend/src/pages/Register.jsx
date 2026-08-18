import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../api";
import logo from "/logo.png";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  city: "",
  password: "",
  confirmPassword: "",
  experience: "",
  truckNumber: "",
  truckType: "",
  capacity: "",
  licenseNumber: "",
  companyName: "",
  contactPerson: "",
  businessType: "",
};

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 10) return;
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // role change
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    setFormData((prev) => ({
      ...initialFormData,
      name: prev.name,
      email: prev.email,
      phone: prev.phone,
      city: prev.city,
      password: prev.password,
      confirmPassword: prev.confirmPassword,
    }));
  };

  // form validate
  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      alert("Name must be at least 2 characters long.");
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      alert("Phone number must be exactly 10 digits.");
      return false;
    }

    if (!role) {
      alert("Please select a role.");
      return false;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }

    return true;
  };

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      password: formData.password,
      role: role,
    };

    if (role === "DRIVER") {
      payload.experience = formData.experience ? Number(formData.experience) : null;
      payload.truckNumber = formData.truckNumber?.trim() || "";
      payload.truckType = formData.truckType || "";
      payload.capacity = formData.capacity ? Number(formData.capacity) : null;
      payload.licenseNumber = formData.licenseNumber?.trim() || "";
    } else if (role === "LOADER") {
      payload.companyName = formData.companyName?.trim() || "";
      payload.contactPerson = formData.contactPerson?.trim() || "";
      payload.businessType = formData.businessType?.trim() || "";
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      alert("Registration successful! Your account is waiting for admin verification.");

      setFormData(initialFormData);
      setRole("");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">
          <img src={logo} alt="logo" />
          <h1>TruckLoad Hub</h1>
        </div>

        <h2>Create an Account</h2>
        <p>Register as a Driver or Loader</p>

     <form onSubmit={handleSubmit}>
        <div className="form-group"><label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} maxLength={50} required /></div>
        <div className="form-group"><label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} maxLength={100} required /></div>
        <div className="form-group"><label htmlFor="phone">Phone</label>
          <input type="tel" id="phone" name="phone" placeholder="Enter your 10 digit phone number" value={formData.phone} onChange={handleChange} maxLength={10} required /></div>
        <div className="form-group"><label htmlFor="city">City</label>
          <input type="text" id="city" name="city" placeholder="Enter your city" value={formData.city} onChange={handleChange} maxLength={50} required /></div>
      
        <div className="form-group">
          <label htmlFor="role">Register As</label>
          <select id="role" value={role} onChange={handleRoleChange} required>
            <option value="">Select Role</option>
            <option value="DRIVER">Driver</option>
            <option value="LOADER">Loader</option>
          </select>
        </div>
      
        {role === "DRIVER" && (
          <div className="profile-section">
            <h3>Driver Information</h3>
            <div className="form-group"><label htmlFor="experience">Experience (years)</label>
              <input type="number" id="experience" name="experience" placeholder="Experience in years" min="0" max="100" value={formData.experience} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="truckNumber">Truck Number</label>
              <input type="text" id="truckNumber" name="truckNumber" placeholder="Enter truck number" value={formData.truckNumber} onChange={handleChange} maxLength={15} required /></div>
            <div className="form-group">
              <label htmlFor="truckType">Truck Type</label>
              <select id="truckType" name="truckType" value={formData.truckType} onChange={handleChange} required>
                <option value="" disabled>Select truck type</option>
                <option value="pickup">Pickup Truck</option>
                <option value="box_truck">Box / Delivery Truck</option>
                <option value="flatbed">Flatbed Truck</option>
                <option value="semi_trailer">Semi-Trailer / Tractor-Trailer</option>
                <option value="dump_truck">Dump Truck</option>
              </select>
            </div>
            <div className="form-group"><label htmlFor="capacity">Capacity (tons)</label>
              <input type="number" id="capacity" name="capacity" placeholder="Capacity in tons" min="0" max="10000" value={formData.capacity} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="licenseNumber">License Number</label>
              <input type="text" id="licenseNumber" name="licenseNumber" placeholder="Enter license number" value={formData.licenseNumber} onChange={handleChange} maxLength={20} required /></div>
          </div>
        )}
      
        {role === "LOADER" && (
          <div className="profile-section">
            <h3>Loader Information</h3>
            <div className="form-group"><label htmlFor="companyName">Company Name</label>
              <input type="text" id="companyName" name="companyName" placeholder="Enter company name" value={formData.companyName} onChange={handleChange} maxLength={100} required /></div>
            <div className="form-group"><label htmlFor="contactPerson">Contact Person</label>
              <input type="text" id="contactPerson" name="contactPerson" placeholder="Enter contact person" value={formData.contactPerson} onChange={handleChange} maxLength={50} required /></div>
            <div className="form-group"><label htmlFor="businessType">Business Type</label>
              <input type="text" id="businessType" name="businessType" placeholder="Example: Manufacturing" value={formData.businessType} onChange={handleChange} maxLength={50} required /></div>
          </div>
        )}
      
        <div className="form-group"><label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} maxLength={50} required /></div>
        <div className="form-group"><label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} maxLength={50} required /></div>
      
        <button type="submit" className="primary-button" disabled={loading}>{loading ? "Registering..." : "Create Account"}</button>
      </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>

      <style>{`
        .auth-page {
          position: relative;
          max-width: 100%;
          margin: 0 auto;
          height: 100vh;
          padding-left: 100px;
          justify-content: flex-start;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          overflow: hidden;
        }

        .auth-page::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url('/bg.png') no-repeat center center / cover;
          transform: scaleX(-1);
          z-index: -1;
        }

        .auth-card {
          width: 100%;
          max-width: 500px;
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

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 6px;
          font-size: 12px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #222;
          background: rgba(255, 255, 255, 0.85);
        }

        .profile-section {
          margin: 15px 0;
          padding: 15px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
        }

        .profile-section h3 {
          margin-bottom: 15px;
          font-size: 16px;
          color: #329fe7;
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

        .primary-button:hover:not(:disabled) {
          background: #60a8cc; 
          color: #051329;
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

export default Register;
