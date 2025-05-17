import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTrash, FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
import "./cartPage.css";

const cartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentFabric, setCurrentFabric] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingItem, setUpdatingItem] = useState(null);
    const [userDetails, setUserDetails] = useState({
        name: "",
        address: "",
        contact: "",
        quantity: "1",
        paymentMethod: "Cash on Delivery",
    });

    const userEmail = localStorage.getItem("userEmail");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartItems = async () => {
            if (!userEmail) {
                setCartItems([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/cart`, {
                    params: { email: userEmail }
                });
                setCartItems(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching cart items:", error);
                setError("Failed to load cart items. Please try again.");
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [userEmail]);

    // Calculate cart summary values
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce((total, item) => total + (item.fabricId.price * item.quantity), 0);
    const total = subtotal; // Add shipping/tax if needed

    const handleRemoveFromCart = async (fabricId) => {
        try {
            await axios.delete("http://localhost:5000/cart", {
                params: { email: userEmail, fabricId }
            });
            setCartItems(prev => prev.filter(item => item.fabricId._id !== fabricId));
            alert("Item removed from cart");
        } catch (error) {
            console.error("Error removing from cart:", error);
            alert("Failed to remove from cart");
        }
    };

    const handleUpdateQuantity = async (fabricId, newQuantity) => {
        // Validate input
        if (isNaN(newQuantity)) newQuantity = 1;
        if (newQuantity < 1) newQuantity = 1;

        setUpdatingItem(fabricId);

        try {
            const response = await axios.put("http://localhost:5000/cart/update-quantity", {
                email: userEmail,
                fabricId,
                quantity: newQuantity
            });

            if (response.data.success) {
                setCartItems(prev => prev.map(item =>
                    item.fabricId._id === fabricId ? { ...item, quantity: newQuantity } : item
                ));
            } else {
                throw new Error(response.data.message || "Failed to update quantity");
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
            alert(error.response?.data?.message || "Failed to update quantity");
        } finally {
            setUpdatingItem(null);
        }
    };
    const handleOrder = (fabric) => {
        setCurrentFabric(fabric);
        setUserDetails(prev => ({
            ...prev,
            quantity: fabric.quantity.toString()
        }));
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const totalPrice = currentFabric.fabricId.price * userDetails.quantity;
            const payload = {
                fabricId: currentFabric.fabricId._id,
                fabricName: currentFabric.fabricId.name,
                userEmail,
                userName: userDetails.name,
                userAddress: userDetails.address,
                userContact: userDetails.contact,
                quantity: userDetails.quantity,
                paymentMethod: userDetails.paymentMethod,
                totalPrice,
            };

            await axios.post("http://localhost:5000/orders", payload);

            // Remove the ordered item from cart
            await axios.delete("http://localhost:5000/cart", {
                params: { email: userEmail, fabricId: currentFabric.fabricId._id }
            });

            alert("Order placed successfully!");
            setShowModal(false);
            setUserDetails({
                name: "",
                address: "",
                contact: "",
                quantity: "1",
                paymentMethod: "Cash on Delivery",
            });

            // Refresh cart items
            const response = await axios.get(`http://localhost:5000/cart`, {
                params: { email: userEmail }
            });
            setCartItems(response.data);
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
                <p>Loading your cart...</p>
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
                    <Link to="/search-fabrics">Search Fabrics</Link>
                    <Link to="/favorites">Favourites</Link>
                    <Link to="/cart" className="active">Cart</Link>
                    <Link to="/contact">Contact</Link>
                    <div className="logout-icon-div" onClick={handleLogout}>
                        <FaSignOutAlt />
                    </div>
                </nav>
            </div>

            <div className="cart-page-container">
                <h2>Your Cart</h2>

                {cartItems.length === 0 ? (
                    <div className="no-items">
                        <p>Your cart is empty.</p>
                        <Link to="/search-fabrics" className="browse-link">
                            Browse Fabrics
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="fabrics-grid">
                            {cartItems.map((item) => (
                                <div key={item.fabricId._id} className="fabric-card">
                                    <img
                                        src={item.fabricId.imageUrl ?
                                            `http://localhost:5000/${item.fabricId.imageUrl}` : // Removed 'uploads/' if it's already in the path
                                            "/default-fabric.jpg"
                                        }
                                        alt={item.fabricId.name}
                                        className="fabric-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/default-fabric.jpg";
                                        }}
                                    />
                                    <div className="fabric-info">
                                        <h3>{item.fabricId.name}</h3>
                                        <p><strong>Color:</strong> {item.fabricId.color}</p>
                                        <p><strong>Price:</strong> ₹{item.fabricId.price} per meter</p>
                                        <p className="fabric-description">
                                            <strong>Description:</strong> {item.fabricId.description}
                                        </p>
                                    </div>
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.fabricId._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1 || updatingItem === item.fabricId._id}
                                            className="quantity-btn"
                                        >
                                            {updatingItem === item.fabricId._id && item.quantity === item.quantity ? '...' : <FaMinus />}
                                        </button>

                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const newValue = parseInt(e.target.value) || 1;
                                                handleUpdateQuantity(item.fabricId._id, newValue);
                                            }}
                                            className="quantity-input"
                                            disabled={updatingItem === item.fabricId._id}
                                        />

                                        <button
                                            onClick={() => handleUpdateQuantity(item.fabricId._id, item.quantity + 1)}
                                            disabled={updatingItem === item.fabricId._id}
                                            className="quantity-btn"
                                        >
                                            {updatingItem === item.fabricId._id && item.quantity === item.quantity ? '...' : <FaPlus />}
                                        </button>
                                    </div>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleRemoveFromCart(item.fabricId._id)}
                                            className="remove-button"
                                        >
                                            <FaTrash /> Remove
                                        </button>
                                        <button
                                            onClick={() => handleOrder(item)}
                                            className="order-button"
                                        >
                                            <FaShoppingCart /> Order
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Attractive Cart Summary */}
                        <div className="cart-summary">
                            <h3 className="cart-summary-title">Order Summary</h3>

                            <div className="summary-row">
                                <span className="summary-label">Subtotal</span>
                                <span className="summary-value">₹{subtotal.toFixed(2)}</span>
                            </div>

                            <div className="summary-row">
                                <span className="summary-label">Items</span>
                                <span className="summary-value">{itemCount}</span>
                            </div>

                            <div className="summary-row total">
                                <span className="summary-label">Total Amount</span>
                                <span className="summary-value">₹{total.toFixed(2)}</span>
                            </div>

                            <button
                                className="checkout-button"
                                onClick={() => setShowModal(true)}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showModal && currentFabric && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Order {currentFabric.fabricId.name}</h3>
                            <div className="fabric-details">
                                <span className="fabric-color" style={{ backgroundColor: currentFabric.fabricId.color.toLowerCase() }}></span>
                                <span>Color: {currentFabric.fabricId.color}</span>
                                <span>₹{currentFabric.fabricId.price} per meter</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="order-form">
                            {/* ... rest of your modal form ... */}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default cartPage;