import { Link } from "react-router-dom";
import logo from "/logo.png";

function Landing() {
  return (
    <div className="landing-wrapper">
      <div className="landing-container">
        
        {/* NAVBAR */}
        <nav className="navbar">
          <a href="#home" className="logo">
            <img src={logo} alt="logo" />
            TruckLoad Hub
          </a>

          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#drivers">Drivers</a>
            <a href="#loaders">Loaders</a>
            <a href="#contact">Contact</a>

            <Link to="/login" className="secondary-button">Login</Link>
            <Link to="/register" className="primary-button">Get Started</Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero" id="home">
          <div className="hero-content">
            <h1>Connect Trucks With Loads</h1>
            <p>
              Find the right load for your truck or connect your shipment with the
              right driver.
            </p>

            <div className="hero-buttons">
              <Link to="/register" state={{ defaultRole: "DRIVER" }} className="primary-button">
                Find Loads
              </Link>
              <Link to="/register" state={{ defaultRole: "LOADER" }} className="secondary-button">
                Post a Load
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-it-works" id="how-it-works">
          <h2>How It Works</h2>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <h3>Register</h3>
              <p>Create your Driver or Loader account.</p>
            </div>

            <div className="step">
              <div className="step-number">02</div>
              <h3>Verify</h3>
              <p>Complete your profile and get verified.</p>
            </div>

            <div className="step">
              <div className="step-number">03</div>
              <h3>Find a Match</h3>
              <p>Drivers find loads and loaders find drivers.</p>
            </div>

            <div className="step">
              <div className="step-number">04</div>
              <h3>Make a Deal</h3>
              <p>Send and accept deal requests.</p>
            </div>

            <div className="step">
              <div className="step-number">05</div>
              <h3>Complete Trip</h3>
              <p>Complete the delivery successfully.</p>
            </div>
          </div>
        </section>

        {/* DRIVERS */}
        <section className="role-section" id="drivers">
          <div className="role-card">
            <div>
              <h2>For Drivers</h2>
              <p>
                Find suitable loads for your truck and connect with verified loaders.
              </p>
            </div>
            <Link to="/register" state={{ defaultRole: "DRIVER" }} className="primary-button">
              Register as Driver
            </Link>
          </div>
        </section>

        {/* LOADERS */}
        <section className="role-section" id="loaders">
          <div className="role-card">
            <div>
              <h2>For Loaders</h2>
              <p>Publish your loads and connect with verified drivers.</p>
            </div>
            <Link to="/register" state={{ defaultRole: "LOADER" }} className="primary-button">
              Register as Loader
            </Link>
          </div>
        </section>

        {/* CONTACT */}
        <section className="contact-section" id="contact">
          <div className="contact-content">
            <h2>Contact Us</h2>
            <p>Have questions or need help? Get in touch with the TL Hub team.</p>

            <div className="contact-info">
              <p><strong>Email:</strong> support@tlhub.com</p>
              <p><strong>Phone:</strong> +91 98765 43210</p>
              <p><strong>Location:</strong> India</p>
            </div>

            <Link to="/contact" className="primary-button">
              Contact Us
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <p>© 2026 TruckLoad Hub. All rights reserved.</p>
        </footer>

      </div>

      <style>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
          color: #222;
          background-color: #f8f9fa; /* Background color behind the 1300px card/container */
        }

        /* OUTER WRAPPER (Full screen width) */
        .landing-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        /* MAIN CONTAINER (Fixed max-width 1300px centered with side margins) */
        .landing-container {
          max-width: 1300px;
          width: 100%;
          margin: 0 auto;
          box-shadow: 0 0 20px rgba(0,0,0,0.05);
          background-color: #ffffff;
          box-sizing: border-box;
        }

        a {
          text-decoration: none;
          padding: 5px 5px;
        }

        /* BUTTONS */
        .primary-button {
          background: #222;
          color: #fff !important;
          padding: 7px 16px;
          border-radius: 6px;
          font-weight: 600;
          display: inline-block;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
        }

        .secondary-button {
          background: #f0f0f0;
          color: #222 !important;
          padding: 7px 16px;
          border-radius: 6px;
          font-weight: 600;
          border: 1px solid #ccc;
          display: inline-block;
          cursor: pointer;
          transition: background 0.2s ease-in-out, border-color 0.2s ease-in-out;
        }

        .primary-button:hover {
          background: #444;
        }

        .secondary-button:hover {
          background: #e0e0e0;
          border-color: #999;
        }

        /* NAVBAR */
        .navbar {
          height: 70px;
          padding: 0 4%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid #696868;
          position: sticky;
          top: 0;
          width: 100%;
          box-sizing: border-box;
          z-index: 1000;
        }

        .logo {
          display: flex;
          flex-direction: row;
          align-items: center;
          font-weight: bold;
          color: #222;
          font-size: 24px;
          gap: 10px;
        }

        .logo img {
          width: 60px;
          height: 60px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .nav-links a {
          color: #0a0909;
        }

        .nav-links a:hover {
          background: #817d7d;
          border-radius: 5px;
          transition: background 0.2s ease-in-out;
        }

        /* HERO */
        .hero {
          padding: 100px 4%;
          text-align: center;
          background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://i.postimg.cc/3J5bzZBj/image.png') no-repeat center/cover;
          width: 100%;
          box-sizing: border-box;
        }

        .hero-content {
          background-color: rgba(226, 226, 226, 0.8);
          border-radius: 8px;
          padding: 20px;
          display: inline-block;
          max-width: 1000px;
          width: 100%;
          box-sizing: border-box;
        }

        .hero h1 {
          font-size: 60px;
          margin-bottom: 16px;
          color: #000;
        }

        .hero p {
          font-size: 18px;
          color: #111;
          margin-bottom: 20px;
        }

        .hero-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }

        /* HOW IT WORKS */
        .how-it-works {
          padding: 65px 4%;
          text-align: center;
          background: #a8a8a8;
          width: 100%;
          box-sizing: border-box;
        }

        .how-it-works h2 {
          font-size: 35px;
          margin-bottom: 20px;
          text-align: center;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }

        .step {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
        }

        .step-number {
          font-size: 24px;
          font-weight: bold;
          color: #555;
        }

        /* ROLE SECTION */
        .role-section {
          padding: 60px 4%;
          width: 100%;
          box-sizing: border-box;
        }

        .role-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          border-radius: 8px;
          border: 1px solid #ddd;
          padding: 30px;
          max-width: 900px;
          margin: 0 auto;
        }

        /* CONTACT SECTION */
        .contact-section {
          padding: 60px 4%;
          background: #f1f1f1;
          width: 100%;
          text-align: center;
          box-sizing: border-box;
        }

        .contact-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .contact-info {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin: 20px 0;
          flex-wrap: wrap;
        }

        /* FOOTER */
        .footer {
          padding: 30px 4%;
          color: #060606;
          background: #a8a8a8;
          text-align: center;
          box-sizing: border-box;
        }

        /* SCROLL OFFSET */
        #home, #how-it-works, #drivers, #loaders, #contact {
          scroll-margin-top: 70px;
        }
      `}</style>
    </div>
  );
}

export default Landing;
