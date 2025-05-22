import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTrash, FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { FaPaypal, FaMoneyBillWave } from 'react-icons/fa';
import "./cartPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const CartPage = () => {
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
        paymentMethod: "PayPal",
    });
    const [orderProcessing, setOrderProcessing] = useState(false);

    const userEmail = localStorage.getItem("userEmail");
    const navigate = useNavigate();

    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", // Use test client ID if not set
        currency: "USD",
        intent: "capture",
    };

    // Fetch cart items
    useEffect(() => {
        if (!userEmail) {
            navigate("/login");
            return;
        }

        const fetchCartItems = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/cart`, {
                    params: { email: userEmail },
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                // Handle different response structures
                if (response.data && Array.isArray(response.data)) {
                    setCartItems(response.data);
                } else if (response.data?.data && Array.isArray(response.data.data)) {
                    setCartItems(response.data.data);
                } else {
                    setCartItems([]);
                }
            } catch (error) {
                console.error("Error fetching cart items:", error);
                setError("Failed to load cart items. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [userEmail, navigate]);

    // Calculate totals
    const itemCount = cartItems.reduce((total, item) => total + (item?.quantity || 0), 0);
    const subtotal = cartItems.reduce((total, item) => {
        const price = item?.fabricId?.price || item?.price || 0;
        const quantity = item?.quantity || 0;
        return total + (price * quantity);
    }, 0);
    const total = subtotal;

    // Cart operations
    const handleRemoveFromCart = async (fabricId) => {
        if (!window.confirm("Are you sure you want to remove this item?")) return;
        
        try {
            await axios.delete(`${API_BASE_URL}/cart`, {
                params: { email: userEmail, fabricId },
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            setCartItems(prev => prev.filter(item => item.fabricId?._id !== fabricId));
        } catch (error) {
            console.error("Error removing from cart:", error);
            alert("Failed to remove item from cart. Please try again.");
        }
    };

    const handleUpdateQuantity = async (fabricId, newQuantity) => {
        newQuantity = Math.max(1, Math.min(100, parseInt(newQuantity) || 1));
        setUpdatingItem(fabricId);

        try {
            await axios.put(`${API_BASE_URL}/cart/update-quantity`, {
                email: userEmail,
                fabricId,
                quantity: newQuantity
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            setCartItems(prev => prev.map(item =>
                item.fabricId?._id === fabricId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (error) {
            console.error("Error updating quantity:", error);
            alert("Failed to update quantity. Please try again.");
        } finally {
            setUpdatingItem(null);
        }
    };

    // Order handling
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

    const processOrder = async (items, paypalOrderId = null) => {
        setOrderProcessing(true);
        try {
            const orderPayload = items.map(item => ({
                fabricId: item.fabricId?._id || item._id,
                fabricName: item.fabricId?.name || item.name,
                userEmail,
                userName: userDetails.name,
                userAddress: userDetails.address,
                userContact: userDetails.contact,
                quantity: currentFabric ? parseInt(userDetails.quantity) : item.quantity,
                paymentMethod: userDetails.paymentMethod,
                totalPrice: (item.fabricId?.price || item.price) * 
                          (currentFabric ? parseInt(userDetails.quantity) : item.quantity),
                ...(paypalOrderId && { paypalOrderId })
            }));

            // Create orders
            await axios.post(`${API_BASE_URL}/orders/bulk`, { orders: orderPayload }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Clear cart
            await axios.delete(`${API_BASE_URL}/cart/bulk`, {
                data: {
                    email: userEmail,
                    fabricIds: items.map(item => item.fabricId?._id || item._id)
                },
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Refresh cart
            const response = await axios.get(`${API_BASE_URL}/cart`, {
                params: { email: userEmail },
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            // Handle response as before
            if (response.data && Array.isArray(response.data)) {
                setCartItems(response.data);
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                setCartItems(response.data.data);
            } else {
                setCartItems([]);
            }

            alert("Order placed successfully!");
            setShowModal(false);
            setUserDetails({
                name: "",
                address: "",
                contact: "",
                quantity: "1",
                paymentMethod: "PayPal",
            });
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setOrderProcessing(false);
        }
    };

    // PayPal handlers
    const createPayPalOrder = (data, actions) => {
        const items = currentFabric ? [currentFabric] : cartItems;
        const total = items.reduce((sum, item) => {
            const price = item.fabricId?.price || item.price || 0;
            const quantity = currentFabric ? parseInt(userDetails.quantity) : item.quantity;
            return sum + (price * quantity);
        }, 0);

        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: total.toFixed(2),
                    currency_code: "USD",
                    breakdown: {
                        item_total: {
                            value: total.toFixed(2),
                            currency_code: "USD"
                        }
                    }
                },
                items: items.map(item => ({
                    name: item.fabricId?.name || item.name,
                    unit_amount: {
                        value: (item.fabricId?.price || item.price).toFixed(2),
                        currency_code: "USD"
                    },
                    quantity: (currentFabric ? userDetails.quantity : item.quantity).toString()
                }))
            }]
        });
    };

    const onPayPalApprove = async (data, actions) => {
        try {
            const details = await actions.order.capture();
            await processOrder(currentFabric ? [currentFabric] : cartItems, details.id);
        } catch (error) {
            console.error("PayPal error:", error);
            alert("Payment processing failed. Please try again or use another method.");
        }
    };

    const handleCashOnDelivery = async (e) => {
        e.preventDefault();
        await processOrder(currentFabric ? [currentFabric] : cartItems);
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("userEmail");
            localStorage.removeItem("isAdmin");
            navigate("/login");
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your cart...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
        </div>
    );

    return (
        <div className="cart-page">
            <div className="navbar">
                <div className="website-name">SaraswathiTex</div>
                <nav className="nav-links">
                    <Link to="/UserDashboard">Home</Link>
                    <Link to="/search-fabrics">Fabrics</Link>
                    {userEmail && <Link to="/favorites">Favourites</Link>}
                    {userEmail && <Link to="/cart">Cart</Link>}
                    {userEmail && <Link to="/orders">My Orders</Link>}
                    <Link to="/contact">Contact</Link>
                    <div className="logout-icon-div" onClick={handleLogout}>
                        <FaSignOutAlt />
                    </div>
                </nav>
            </div>

            <div className="cart-container">
                <h2>Your Shopping Cart</h2>
                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty</p>
                        <Link to="/search-fabrics" className="browse-btn">Browse Fabrics</Link>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.fabricId?._id || item._id} className="cart-item">
                                    <img 
                                        src={item.fabricId?.imageUrl || item.imageUrl} 
                                        alt={item.fabricId?.name || item.name} 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                        }}
                                    />
                                    <div className="item-details">
                                        <h3>{item.fabricId?.name || item.name}</h3>
                                        <p className="price">₹{item.fabricId?.price || item.price}</p>
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.fabricId?._id || item._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || updatingItem === (item.fabricId?._id || item._id)}
                                            >
                                                <FaMinus />
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateQuantity(item.fabricId?._id || item._id, e.target.value)}
                                                disabled={updatingItem === (item.fabricId?._id || item._id)}
                                                min="1"
                                                max="100"
                                            />
                                            <button
                                                onClick={() => handleUpdateQuantity(item.fabricId?._id || item._id, item.quantity + 1)}
                                                disabled={updatingItem === (item.fabricId?._id || item._id)}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                        <div className="item-actions">
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemoveFromCart(item.fabricId?._id || item._id)}
                                            >
                                                <FaTrash /> Remove
                                            </button>
                                            <button
                                                className="order-btn"
                                                onClick={() => handleOrder(item)}
                                            >
                                                <FaShoppingCart /> Order Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Items:</span>
                                <span>{itemCount}</span>
                            </div>
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                            <button
                                className="checkout-btn"
                                onClick={() => {
                                    setCurrentFabric(null); 
                                    setShowModal(true);
                                }}
                                disabled={cartItems.length === 0}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Order Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <button 
                            className="modal-close" 
                            onClick={() => !orderProcessing && setShowModal(false)}
                            disabled={orderProcessing}
                        >
                            &times;
                        </button>
                        <h3 className="modal-heading">
                            {currentFabric ? `Order ${currentFabric.fabricId?.name || currentFabric.name}` : "Checkout"}
                        </h3>

                        <form onSubmit={userDetails.paymentMethod === "Cash on Delivery" ? handleCashOnDelivery : (e) => e.preventDefault()}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your full name"
                                    value={userDetails.name}
                                    onChange={handleInputChange}
                                    required
                                    disabled={orderProcessing}
                                />
                            </div>

                            <div className="form-group">
                                <label>Delivery Address *</label>
                                <textarea
                                    name="address"
                                    placeholder="Full delivery address with zip code"
                                    value={userDetails.address}
                                    onChange={handleInputChange}
                                    required
                                    rows="4"
                                    disabled={orderProcessing}
                                />
                            </div>

                            <div className="form-group">
                                <label>Contact Number *</label>
                                <input
                                    type="tel"
                                    name="contact"
                                    placeholder="Phone number for delivery updates"
                                    value={userDetails.contact}
                                    onChange={handleInputChange}
                                    required
                                    disabled={orderProcessing}
                                    pattern="[0-9]{10,15}"
                                    title="Please enter a valid phone number"
                                />
                            </div>

                            {currentFabric && (
                                <div className="form-group">
                                    <label>Quantity *</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        max="100"
                                        value={userDetails.quantity}
                                        onChange={handleInputChange}
                                        required
                                        disabled={orderProcessing}
                                    />
                                </div>
                            )}

                            <div className="payment-section">
                                <h4>Payment Method *</h4>
                                <div className="payment-options">
                                    <label className={`payment-option ${userDetails.paymentMethod === "PayPal" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="PayPal"
                                            checked={userDetails.paymentMethod === "PayPal"}
                                            onChange={handleInputChange}
                                            disabled={orderProcessing}
                                        />
                                        <div className="payment-content">
                                            <FaPaypal className="payment-icon" />
                                            <span>PayPal</span>
                                        </div>
                                    </label>

                                    <label className={`payment-option ${userDetails.paymentMethod === "Cash on Delivery" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Cash on Delivery"
                                            checked={userDetails.paymentMethod === "Cash on Delivery"}
                                            onChange={handleInputChange}
                                            disabled={orderProcessing}
                                        />
                                        <div className="payment-content">
                                            <FaMoneyBillWave className="payment-icon" />
                                            <span>Cash on Delivery</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="order-summary-section">
                                <h4>Order Summary</h4>
                                <div className="order-items">
                                    {currentFabric ? (
                                        <div className="order-item">
                                            <span>{currentFabric.fabricId?.name || currentFabric.name}</span>
                                            <span>₹{(
                                                (currentFabric.fabricId?.price || currentFabric.price) * 
                                                parseInt(userDetails.quantity)
                                            ).toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        cartItems.map(item => (
                                            <div key={item.fabricId?._id || item._id} className="order-item">
                                                <span>{item.fabricId?.name || item.name} (x{item.quantity})</span>
                                                <span>₹{(
                                                    (item.fabricId?.price || item.price) * 
                                                    item.quantity
                                                ).toFixed(2)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="order-total">
                                    <span>Total</span>
                                    <span>₹{currentFabric
                                        ? (
                                            (currentFabric.fabricId?.price || currentFabric.price) * 
                                            parseInt(userDetails.quantity)
                                        ).toFixed(2)
                                        : total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {userDetails.paymentMethod === "PayPal" && (
                                <div className="paypal-button-container">
                                    <PayPalScriptProvider options={initialOptions}>
                                        <PayPalButtons
                                            style={{ layout: "vertical", shape: "pill" }}
                                            createOrder={createPayPalOrder}
                                            onApprove={onPayPalApprove}
                                            onError={(err) => {
                                                console.error("PayPal error:", err);
                                                alert("Payment failed. Please try again or use another method.");
                                            }}
                                            disabled={orderProcessing}
                                        />
                                    </PayPalScriptProvider>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowModal(false)}
                                    disabled={orderProcessing}
                                >
                                    Cancel
                                </button>

                                {userDetails.paymentMethod === "Cash on Delivery" && (
                                    <button
                                        type="submit"
                                        className="confirm-btn"
                                        disabled={orderProcessing}
                                    >
                                        {orderProcessing ? (
                                            <span className="processing">
                                                <div className="spinner"></div>
                                                Processing...
                                            </span>
                                        ) : (
                                            "Confirm Order"
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;