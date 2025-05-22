import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import Payment from "./Payment.jsx";
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
      <Payment
        items={[currentFabric]}
        isSingleProduct={true}
        defaultQuantity={userDetails.quantity}
        onSuccess={async (orderPayload) => {
          try {
            await axios.post("http://localhost:5000/orders", orderPayload[0]);
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
            throw error; // This will be caught by the Payment component
          }
        }}
        onCancel={() => setShowModal(false)}
      />
    </div>
  </div>
)}
    </div>
  );
};

export default FavoritesPage;
