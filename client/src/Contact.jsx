import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from "react-icons/fa";
import './contact.css';

const Contact = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // or any relevant cleanup
    navigate("/login");
  };

  return (
    <>
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div>
        <nav className="nav-links">
          <Link to="/UserDashBoard">Home</Link>
          <Link to="/search-fabrics">Search Fabrics</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/contact">Contact</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>

      <section className="contact-section">
        <div className="contact-banner">
          <h1 className="contact-title">Get in Touch with Saraswathi Tex</h1>
          <p className="contact-subtitle">Quality Fabrics, Personal Service</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-item">
              <span className="icon">📍</span>
              <div>
                <h3>Address</h3>
                <p>95, Sivanar Street No.3, Gugai,</p>
                <p>Salem - 636006</p>
              </div>
            </div>

            <div className="info-item">
              <span className="icon">✉️</span>
              <div>
                <h3>Email</h3>
                <a href="mailto:saraswathitexx@gmail.com">saraswathitexx@gmail.com</a>
              </div>
            </div>

            <div className="info-item">
              <span className="icon">📞</span>
              <div>
                <h3>Phone</h3>
                <a href="tel:+919092152524">+91 90921 52524</a>
              </div>
            </div>
          </div>

          <div className="contact-map-wrapper">
            <iframe
              title="Saraswathi Tex Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3938.5555046827456!2d78.1439290152993!3d11.664433991641906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf75db1a5d2ef%3A0x3ab78cc6ac3d8b99!2sSivanar%20Street%20No.3%2C%20Gugai%2C%20Salem%2C%20Tamil%20Nadu%20636006!5e0!3m2!1sen!2sin!4v1693879200000!5m2!1sen!2sin"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <footer className="contact-footer">
          <p>© 2025 Saraswathi Tex — Bringing Fabrics to Life</p>
        </footer>
      </section>
    </>
  );
};

export default Contact;
