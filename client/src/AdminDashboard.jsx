// src/AdminDashboard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css'; // Import your CSS
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon
import './LogoutButton.css'; // Optional: Add specific styles for the div

const AdminDashboard = () => {
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
      {/* Navbar */}
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div> {/* Website Name on the left */}
        <nav className="nav-links"> {/* Navigation Links on the right */}
          <Link to="/AdminDashboard">Home</Link>
          <Link to="/manage-fabric">Manage Products</Link>
          <Link to="/search">Search</Link>
          <Link to="/view-orders">View Orders</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1>Weaving Excellence into Every Thread</h1>
        <p className="con">
          Welcome to SaraswathiTex, where tradition meets innovation. As an admin, you can manage our premium collection of fabrics, oversee orders, and ensure our customers receive the finest textiles. Explore the dashboard to manage products, view orders, and more.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;