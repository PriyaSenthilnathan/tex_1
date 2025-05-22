import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import "./FavouritesPage.css";
import "./LogoutButton.css";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentFabric, setCurrentFabric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: "",
    address: "",
    contact: "",
    quantity: 1,
    paymentMethod: "Cash on Delivery",
  });

  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userEmail) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/favorites`, {
          params: { email: userEmail },
        });

        setFavorites(response.data.map((fav) => fav.fabricId));
        setError(null);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setError("Failed to load favorites. Please try again.");
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userEmail]);

  const handleRemoveFavorite = async (fabricId) => {
    try {
      await axios.delete("http://localhost:5000/favorites", {
        params: { email: userEmail, fabricId },
      });

      setFavorites((prev) => prev.filter((f) => f?._id !== fabricId));
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove from favorites");
    }
  };

  const handleOrder = (fabric) => {
    setCurrentFabric(fabric);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: name === "quantity" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalPrice = currentFabric.price * userDetails.quantity;
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

      await axios.post("http://localhost:5000/orders", payload);
      alert("Order placed successfully!");
      setShowModal(false);
      setUserDetails({
        name: "",
        address: "",
        contact: "",
        quantity: 1,
        paymentMethod: "Cash on Delivery",
      });
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isAdmin");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading your favorites...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="home-container">
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div>
        <nav className="nav-links">
          <Link to="/UserDashboard">Home</Link>
          <Link to="/search-fabrics">Fabrics</Link>
          <Link to="/favorites" className="active">
            Favourites
          </Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/contact">Contact</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>

      <div className="favorites-page-container">
        <h2>Your Favourites</h2>

        {favorites.length === 0 ? (
          <div className="no-favorites">
            <p>You haven't added any favorites yet.</p>
            <Link to="/search-fabrics" className="browse-link">
              Browse Fabrics
            </Link>
          </div>
        ) : (
          <div className="fabrics-grid">
            {favorites.map((fabric) => {
              if (!fabric) return null; // Skip null or undefined fabric

              return (
                <div key={fabric._id} className="fabric-card">
                  <img
                    src={fabric.imageUrl || "/default-fabric.jpg"}
                    alt={fabric.name || "Fabric Image"}
                    className="fabric-image"
                  />
                  <div className="fabric-info">
                    <h3>{fabric.name || "No Name"}</h3>
                    <p>
                      <strong>Color:</strong> {fabric.color || "N/A"}
                    </p>
                    <p>
                      <strong>Price:</strong> ₹{fabric.price ?? "N/A"} per meter
                    </p>
                  </div>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleRemoveFavorite(fabric._id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleOrder(fabric)}
                      className="order-button"
                    >
                      Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && currentFabric && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Order {currentFabric.name}</h3>
              <div className="fabric-details">
                <span
                  className="fabric-color"
                  style={{ backgroundColor: currentFabric.color?.toLowerCase() || "#ccc" }}
                ></span>
                <span>Color: {currentFabric.color || "N/A"}</span>
                <span>₹{currentFabric.price} per meter</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-section">
                <h4 className="section-title">Shipping Details</h4>
                <div className="form-group">
                  <label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={userDetails.name}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <textarea
                      name="address"
                      placeholder="Complete Address"
                      value={userDetails.address}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <div className="phone-input-container">
                    <span className="country-code">+91</span>
                    <input
                      type="tel"
                      name="contact"
                      placeholder="9876543210"
                      value={userDetails.contact}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{10}"
                      title="Please enter a 10-digit phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Order Summary</h4>
                <div className="quantity-selector">
                  <label>Quantity (meters)</label>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() =>
                        setUserDetails((prev) => ({
                          ...prev,
                          quantity: Math.max(1, prev.quantity - 1),
                        }))
                      }
                      className="quantity-btn"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={userDetails.quantity}
                      onChange={handleInputChange}
                      className="quantity-input"
                      style={{
                        width:
                          Math.max(2, userDetails.quantity.toString().length) * 10 +
                          20,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setUserDetails((prev) => ({
                          ...prev,
                          quantity: prev.quantity + 1,
                        }))
                      }
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="price-summary">
                  <div className="price-row">
                    <span>Price per meter</span>
                    <span>₹{currentFabric.price}</span>
                  </div>
                  <div className="price-row">
                    <span>Total Price</span>
                    <span>₹{currentFabric.price * userDetails.quantity}</span>
                  </div>
                </div>

                <div className="payment-method-section">
                  <label htmlFor="paymentMethod" className="payment-method-label">
                    Select Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={userDetails.paymentMethod}
                    onChange={handleInputChange}
                    className="payment-select"
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Online Payment">Online Payment</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="submit-order-button">
                  Place Order
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-order-button"
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
