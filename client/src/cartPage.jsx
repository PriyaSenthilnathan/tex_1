import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./CartPage.css";
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon
import "./LogoutButton.css"; // Optional: Add specific styles for the div

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentFabric, setCurrentFabric] = useState(null);

  const [userDetails, setUserDetails] = useState({
    name: "",
    address: "",
    contact: "",
    quantity: 1,
    paymentMethod: "",
  });

  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  // Fetch the cart items when the page loads
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userEmail) {
        console.error("User email is not available.");
        return;
      }

      try {
        const response = await axios.get(
          `https://your-api-endpoint.com/cart?email=${userEmail}` // Update API endpoint
        );
        console.log("Cart items fetched:", response.data);
        setCartItems(response.data); // Set the cart items to state
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems(); // Fetch the items when the component mounts or userEmail changes
  }, [currentFabric, userEmail]);

  const handleBuy = (fabric) => {
    console.log("Selected fabric:", fabric); // Verify the fabric object
    setCurrentFabric(fabric); // Store the whole fabric object, not just the _id
    setShowModal(true); // Show modal
  };

  const deleteFabric = async (fabricName) => {
    if (!fabricName) {
      console.error("Invalid fabric name:", fabricName);
      return alert("Failed to delete. Fabric name is invalid.");
    }

    try {
      const response = await axios.delete("https://your-api-endpoint.com/del", {
        data: { fabricName, email: userEmail }, // Send the fabricName and userEmail in the request body
      });

      if (response.data.success) {
        alert("Fabric removed from the cart successfully!");

        // Update the state immediately to remove the fabric from the UI
        setCartItems(cartItems.filter((item) => item.name !== fabricName));
      } else {
        alert("Failed to remove the fabric from the cart.");
      }
    } catch (error) {
      console.error("Error deleting fabric:", error);
      alert("An error occurred while removing the fabric.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalPrice = currentFabric.price * userDetails.quantity; // Calculate total price
    if (!currentFabric) {
      console.error("Current fabric is not selected.");
      alert("Please select a fabric before submitting the order.");
      return;
    }

    const payload = {
      fabricId: currentFabric?.fabricId || currentFabric?._id, // Check for fabricId first
      fabricName: currentFabric?.name,
      userEmail,
      userName: userDetails.name,
      userAddress: userDetails.address,
      userContact: userDetails.contact,
      quantity: userDetails.quantity,
      paymentMethod: userDetails.paymentMethod,
      totalPrice, // Log the total price
    };

    console.log("Submitting order with payload:", payload); // Verify payload

    axios
      .post("https://your-api-endpoint.com/orders", payload) // Update API endpoint
      .then(() => {
        alert("Order placed successfully!");
        setShowModal(false);
        setUserDetails({ name: "", address: "", contact: "" });
      })
      .catch((error) => {
        console.error("Error placing order:", error);
      });
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
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
          <Link to="/UserDashboard">Home</Link>
          <Link to="/searchfabrics">Search Fabrics</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/cart">Cart</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>

      <div className="cart-page-container">
        <h2>Your Cart</h2>
        <div className="fabrics-grid">
          {cartItems.length === 0 ? (
            <p>No items in cart.</p>
          ) : (
            cartItems.map((fabric) => (
              <div key={fabric._id} className="fabric-item">
                <h3>{fabric.name}</h3>
                <p>
                  <strong>Material:</strong> {fabric.material}
                </p>
                <p>
                  <strong>Color:</strong> {fabric.color}
                </p>
                <p>
                  <strong>Price:</strong> ₹{fabric.price} per meter
                </p>
                <p>
                  <strong>Description:</strong> {fabric.description}
                </p>
                <img
                  src={fabric.imageUrl}
                  alt={fabric.name}
                  className="fabric-image"
                />
                <button onClick={() => handleBuy(fabric)} className="buy-button">
                  Buy
                </button>
                <button
                  onClick={() => deleteFabric(fabric.name)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
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

export default CartPage;