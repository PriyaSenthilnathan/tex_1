import React from 'react';
import { Link } from 'react-router-dom';
import './home.css'; // Import your CSS

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1>Premium Fabrics for Every Need</h1>
        <p className="con">
          At SaraswathiTex, we bring you the finest fabrics crafted with precision and care. From luxurious silks to durable cottons, our collection is designed to meet your every requirement. Explore our range and experience the art of quality textiles.
        </p>
      </div>
    </div>
  );
};

export default HomePage;