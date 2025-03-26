// UserDashBoard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserDashBoard.css';
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon

const UserDashBoard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      // Clear user data from local storage
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isAdmin");
      navigate("/login"); // Redirect to the login page
    }
  };

  return (
    <div className="home-container">
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div>
        <nav className="nav-links">
          <Link to="/UserDashBoard">Home</Link>
          <Link to="/search-fabrics">Search Fabrics</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/cart">Cart</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>
      <div className="content">
        <h1>Welcome to SaraswathiTex</h1>
        <p className="description">
          Your one-stop destination for premium fabrics. Explore our vast
          collection of textiles, from luxurious silks to durable cottons.
          Whether you’re looking for materials for fashion, home decor, or
          crafts, we have it all!
        </p>
      </div>
    </div>
  );
};

export default UserDashBoard;