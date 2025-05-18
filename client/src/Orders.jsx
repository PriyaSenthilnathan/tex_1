import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import "./Orders.css";
import "./LogoutButton.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/orders?email=${localStorage.getItem("userEmail")}`
        );
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="order-page">
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div>
        <nav className="nav-links">
          <Link to="/UserDashboard">Home</Link>
          <Link to="/search-fabrics">Fabrics</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders" className="active">
            My Orders
          </Link>
          <Link to="/contact">Contact</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <h3>Order #{order._id.slice(-5).toUpperCase()}</h3>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.orderTime).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status ${order.status?.toLowerCase() || ""}`}>
                  {order.status || "Pending"}
                </span>
              </p>
              <ul>
                <li>
                  {order.fabricName} — {order.quantity} meters
                </li>
              </ul>
              <p>
                <strong>Total:</strong> ₹{order.totalPrice}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
