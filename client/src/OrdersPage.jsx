import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrdersPage.css';
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon
import './LogoutButton.css'; // Optional: Add specific styles for the div

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch orders from the backend
  useEffect(() => {
    axios
      .get('/mock-orders.json') // Replace with your actual API endpoint
      .then((response) => {
        setOrders(response.data); // Update orders state with the response data
        setIsLoading(false); // Indicate loading has completed
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.'); // Display a user-friendly error message
        setIsLoading(false); // Indicate loading has completed, even in error scenarios
      });
  }, []); // Empty dependency array to run only once on component mount

  // Handle logout
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      // Clear user data from local storage
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isAdmin");
      navigate("/login"); // Redirect to the login page
    }
  };

  // Display loading, error, or orders
  if (isLoading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="home-container">
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div>
        <nav className="nav-links">
          <Link to="/AdminDashboard">Home</Link>
          <Link to="/manage-fabric">Manage Fabrics</Link>
          <Link to="/search">Search</Link>
          <Link to="/view-orders">View Orders</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>

      <div className="orders-page-container">
  <h2>All Orders</h2>
  {orders.length === 0 ? (
    <p>No orders placed yet.</p>
  ) : (
    <ul className="orders-list">
      {orders.map((order) => (
        <li key={order._id} className="order-item">
          <h3>Fabric Name: {order.fabricName}</h3>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>User Name:</strong> {order.userName}</p>
          <p><strong>Email:</strong> {order.userEmail}</p>
          <p><strong>Address:</strong> {order.userAddress}</p>
          <p><strong>Contact:</strong> {order.userContact}</p>
          <p><strong>Quantity (in meters):</strong> {order.quantity}</p>
          <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          <p>
            <strong>Order Time:</strong>{' '}
            {order.orderTime
              ? new Date(order.orderTime).toLocaleString()
              : 'Invalid Date'}
          </p>
        </li>
      ))}
    </ul>
  )}
</div>
    </div>
  );
};

export default OrdersPage;