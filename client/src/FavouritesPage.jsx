import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./FavouritesPage.css";
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon
import "./LogoutButton.css"; // Optional: Add specific styles for the div

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentFabric, setCurrentFabric] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: "",
    address: "",
    contact: "",
    quantity: "",
    paymentMethod: "",
  });

  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    if (userEmail) {
      axios
        .get(`https://your-api-endpoint.com/favorites?email=${userEmail}`) // Update API endpoint
        .then((response) => {
          if (Array.isArray(response.data)) {
            setFavorites(response.data);
          } else {
            setFavorites([]);
            console.error("Unexpected data format:", response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching favorites:", error);
          setFavorites([]); // Default to empty array if there's an error
        });
    }
  }, [userEmail]);

  const handleBuy = (fabric) => {
    setCurrentFabric(fabric);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalPrice = currentFabric?.price * userDetails.quantity;
    const payload = {
      fabricId: currentFabric._id,
      fabricName: currentFabric.name,
      userEmail,
      userName: userDetails.name,
      userAddress: userDetails.address,
      userContact: userDetails.contact,
      quantity: userDetails.quantity,
      paymentMethod: userDetails.paymentMethod,
      totalPrice,
    };

    axios
      .post("https://your-api-endpoint.com/orders", payload) // Update API endpoint
      .then(() => {
        alert("Order placed successfully!");
        setShowModal(false);
        setUserDetails({
          name: "",
          address: "",
          contact: "",
          quantity: "",
          paymentMethod: "",
        });
      })
      .catch((error) => console.error("Error placing order:", error));
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isAdmin");
      navigate("/login");
    }
  };

  return (
    <div className="home-container">
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div>
        <nav className="nav-links">
          <Link to="/UserDashboard">Home</Link>
          <Link to="/search-fabrics">Search Fabrics</Link>
          <Link to="/favorites">Favourites</Link>
          <Link to="/cart">Cart</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>

      <div className="favorites-page-container">
        <h2>Your Favorites</h2>
        <div className="fabrics-grid">
          {favorites.length === 0 ? (
            <p>No favorites added yet.</p>
          ) : (
            favorites.map((fabric, index) =>
              fabric ? (
                <div key={fabric._id || index} className="fabric-item">
                  <h3>{fabric.name || "Unnamed Fabric"}</h3>
                  <p>
                    <strong>Material:</strong> {fabric.material || "Unknown"}
                  </p>
                  <p>
                    <strong>Color:</strong> {fabric.color || "Unknown"}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹{fabric.price || "Unknown"} per meter
                  </p>
                  <p>
                    <strong>Description:</strong> {fabric.description || "No description available"}
                  </p>
                  <img
                    src={fabric.imageUrl || "default-image-url.jpg"}
                    alt={fabric.name || "Fabric image"}
                    className="fabric-image"
                  />
                  <button onClick={() => handleBuy(fabric)} className="buy-button">
                    Buy
                  </button>
                </div>
              ) : (
                <div key={index} className="fabric-item">
                  <p>Invalid fabric data</p>
                </div>
              )
            )
          )}
        </div>
      </div>

      {showModal && currentFabric && (
        <div className="modal">
          <div className="modal-content">
            <h2>Order Details</h2>
            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userDetails.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <textarea
                  id="address"
                  name="address"
                  value={userDetails.address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete address"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact">Contact:</label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={userDetails.contact}
                  onChange={handleInputChange}
                  placeholder="Enter your contact number"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity (in meters):</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={userDetails.quantity}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Price:</label>
                <p>₹{currentFabric.price * (userDetails.quantity || 0)}</p>
              </div>
              <div className="form-group">
                <label>Payment Method:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credit Card"
                      checked={userDetails.paymentMethod === "Credit Card"}
                      onChange={handleInputChange}
                    />
                    Credit Card
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Debit Card"
                      checked={userDetails.paymentMethod === "Debit Card"}
                      onChange={handleInputChange}
                    />
                    Debit Card
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={userDetails.paymentMethod === "Cash on Delivery"}
                      onChange={handleInputChange}
                    />
                    Cash on Delivery
                  </label>
                </div>
              </div>
              <div className="form-buttons">
                <button type="submit" className="submit-button">
                  Place Order
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;