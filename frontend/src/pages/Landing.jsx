import { Link } from "react-router-dom";
import logo from "/logo.png";

function Landing() {
  return (
    <div className="landing">
   
      <nav className="navbar">
        <div className="section-container nav-container">
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
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="section-container">
          <div className="hero-content">
            <h1>Connect Trucks With Loads</h1>
            <p>
              Find the right load for your truck or connect your shipment with the
              right driver.
            </p>

            <div className="hero-buttons">
              <Link to="/register" state={{ defaultRole: "DRIVER" }} className="primary-button"> Find Loads </Link>
              <Link to="/register" state={{ defaultRole: "LOADER" }} className="secondary-button"> Post a Load </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="section-container">
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
        </div>
      </section>

      <section className="role-section" id="drivers">
        <div className="section-container">
          <div className="role-card">
            <div>
              <h2>For Drivers</h2>
              <p>
                Find suitable loads for your truck and connect with verified
                loaders.
              </p>
            </div>
            <Link to="/register" state={{ defaultRole: "DRIVER" }} className="primary-button"> Register as Driver</Link>
          </div>
        </div>
      </section>

      <section className="role-section" id="loaders">
        <div className="section-container">
          <div className="role-card">
            <div>
              <h2>For Loaders</h2>
              <p> Publish your loads and connect with verified drivers.</p>
            </div>
            <Link to="/register" state={{ defaultRole: "LOADER" }} className="primary-button"> Register as Loader </Link>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-container">
          <div className="contact-content">
            <h2>Contact Us</h2>
            <p> Have questions or need help? Get in touch with the TL Hub team. </p>

            <div className="contact-info">
              <p>
                <strong>Email:</strong> support@tlhub.com
              </p>
              <p>
                <strong>Phone:</strong> +91 98765 43210
              </p>
              <p>
                <strong>Location:</strong> India
              </p>
            </div>

            <Link to="/contact" className="primary-button">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="section-container">
          <p>© 2026 TruckLoad Hub. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        /* MODERN MAXIMUM CONTENT WRAPPER */
        .section-container {
          max-width: 1300px;
          margin: 0 auto;
          width: 100%;
        }

        a {
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
          display: inline-block; 
          border: 1.3px solid #464646; 
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

        /* NAVBAR (Fills screen width) */
        .navbar {
          height: 70px;
          padding: 0 6%;
          background: white;
          border-bottom: 1px solid #696868;
          position: sticky;
          top: 0;
          width: 100%;
          z-index: 1000;
        }

        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        }

        .logo {
          display: flex;
          flex-direction: row;
          align-items: center;
          font-weight: bold;
          color: #222;
          font-size: 24px;
        }

        .logo img { 
          width: 60px;
          height: 60px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-links a {
          color: #0a0909;
        }

        .nav-links a:hover {
          background: #817d7d; 
          border-radius: 5px;
          transition: background 0.2s ease-in-out; 
        }
        
        /* HERO (Image expands up to full screen width) */
        .hero { 
          padding: 100px 6%; 
          text-align: center; 
          background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://postimg.cc') no-repeat center/cover; 
          width: 100%;
        }

        .hero-content {
          background-color: rgba(226, 226, 226, 0.8); 
          border-radius: 8px;
          padding: 5px 20px 20px;
          display: inline-block;
          max-width: 1000px;
          width: 100%;
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

        /* HOW IT WORKS (Gray panel stretches across screen width) */
        .how-it-works {
          padding: 65px 6%;
          text-align: center;
          background: #a8a8a8;
          width: 100%;
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
          padding: 24px;
          background: #f9f9f9;
          border-radius: 8px;
          border: 2px solid #9b9b9b;
        }

        .step-number {
          font-size: 28px;
          font-weight: bold;
          color: #f5f4f4;
          background: #9b9b9b;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        /* ROLE SECTION */
        .role-section {
          padding: 80px 6% 40px;
          width: 100%;
        }

        .role-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          padding: 30px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        /* CONTACT SECTION */
        .contact-section {
          padding: 80px 6%;
          background: #f1f1f1;
          width: 100%;
          text-align: center;
        }

        .contact-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .contact-info {
          margin: 20px 0;
        }

        /* FOOTER */
        .footer {
          padding: 30px 6%;
          background: #222;
          color: #fff;
          text-align: center;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

export default Landing;
