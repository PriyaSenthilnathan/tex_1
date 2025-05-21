import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTrash, FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { FaPaypal, FaMoneyBillWave } from 'react-icons/fa';

import "./cartPage.css";

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
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
    };

    // Fetch cart items
    useEffect(() => {
         const fetchCartItems = async () => {
        if (!userEmail) {
            navigate("/login"); // Redirect unauthenticated user
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/cart`, {
                params: { email: userEmail }
            });
            setCartItems(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching cart items:", error);
            setError("Failed to load cart items");
        } finally {
            setLoading(false);
        }
    };

        fetchCartItems();
    }, [userEmail]);

    // Calculate totals
    const itemCount = cartItems.reduce((total, item) => total + (item?.quantity || 0), 0);
    const subtotal = cartItems.reduce((total, item) => total + (item?.fabricId?.price || 0) * (item?.quantity || 0), 0);
    const total = subtotal;

    // Cart operations
    const handleRemoveFromCart = async (fabricId) => {
        try {
            await axios.delete("http://localhost:5000/cart", {
                params: { email: userEmail, fabricId }
            });
            setCartItems(prev => prev.filter(item => item.fabricId?._id !== fabricId));
        } catch (error) {
            console.error("Error removing from cart:", error);
            alert("Failed to remove from cart");
        }
    };

    const handleUpdateQuantity = async (fabricId, newQuantity) => {
        newQuantity = Math.max(1, parseInt(newQuantity) || 1);
        setUpdatingItem(fabricId);

        try {
            await axios.put("http://localhost:5000/cart/update-quantity", {
                email: userEmail,
                fabricId,
                quantity: newQuantity
            });
            setCartItems(prev => prev.map(item =>
                item.fabricId?._id === fabricId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (error) {
            console.error("Error updating quantity:", error);
            alert("Failed to update quantity");
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
                fabricId: item.fabricId?._id,
                fabricName: item.fabricId?.name,
                userEmail,
                userName: userDetails.name,
                userAddress: userDetails.address,
                userContact: userDetails.contact,
                quantity: item.quantity,
                paymentMethod: userDetails.paymentMethod,
                totalPrice: item.fabricId?.price * item.quantity,
                ...(paypalOrderId && { paypalOrderId })
            }));

            // Create orders
            await axios.post("http://localhost:5000/orders/bulk", { orders: orderPayload });

            // Clear cart
            await axios.delete("http://localhost:5000/cart/bulk", {
                data: {
                    email: userEmail,
                    fabricIds: items.map(item => item.fabricId?._id)
                }
            });

            // Refresh cart
            const response = await axios.get(`http://localhost:5000/cart`, {
                params: { email: userEmail }
            });
            setCartItems(response.data?.data || []);

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
            alert("Failed to place order");
        } finally {
            setOrderProcessing(false);
        }
    };

    // PayPal handlers
    const createPayPalOrder = (data, actions) => {
        const items = currentFabric ? [currentFabric] : cartItems;
        const total = items.reduce((sum, item) => sum + (item.fabricId?.price * item.quantity), 0);

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
                    name: item.fabricId?.name,
                    unit_amount: {
                        value: item.fabricId?.price.toFixed(2),
                        currency_code: "USD"
                    },
                    quantity: item.quantity.toString()
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
            alert("Payment processing failed");
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
    

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

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
                                <div key={item.fabricId?._id} className="cart-item">
                                    <img src={item.fabricId?.imageUrl} alt={item.fabricId?.name} />
                                    <div className="item-details">
                                        <h3>{item.fabricId?.name}</h3>
                                        <p className="price">₹{item.fabricId?.price}</p>
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.fabricId?._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || updatingItem === item.fabricId?._id}
                                            >
                                                <FaMinus />
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateQuantity(item.fabricId?._id, e.target.value)}
                                                disabled={updatingItem === item.fabricId?._id}
                                            />
                                            <button
                                                onClick={() => handleUpdateQuantity(item.fabricId?._id, item.quantity + 1)}
                                                disabled={updatingItem === item.fabricId?._id}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                        <div className="item-actions">
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemoveFromCart(item.fabricId?._id)}
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
                        <button className="modal-close" onClick={() => setShowModal(false)} disabled={orderProcessing}>
                            &times;
                        </button>
                        <h3 className="modal-heading">
                            {currentFabric ? `Order ${currentFabric.fabricId?.name}` : "Checkout"}
                        </h3>

                        <form onSubmit={userDetails.paymentMethod === "Cash on Delivery" ? handleCashOnDelivery : (e) => e.preventDefault()}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your full name"
                                    value={userDetails.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Delivery Address</label>
                                <textarea
                                    name="address"
                                    placeholder="Full delivery address with zip code"
                                    value={userDetails.address}
                                    onChange={handleInputChange}
                                    required
                                    rows="4"
                                />
                            </div>

                            <div className="form-group">
                                <label>Contact Number</label>
                                <input
                                    type="tel"
                                    name="contact"
                                    placeholder="Phone number for delivery updates"
                                    value={userDetails.contact}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {currentFabric && (
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={userDetails.quantity}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            )}

                            <div className="payment-section">
                                <h4>Payment Method</h4>
                                <div className="payment-options">
                                    <label className={`payment-option ${userDetails.paymentMethod === "PayPal" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="PayPal"
                                            checked={userDetails.paymentMethod === "PayPal"}
                                            onChange={handleInputChange}
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
                                        <>
                                            <div className="order-item">
                                                <span>{currentFabric.fabricId?.name}</span>
                                                <span>₹{(currentFabric.fabricId?.price * currentFabric.quantity).toFixed(2)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        cartItems.map(item => (
                                            <div key={item.fabricId?._id} className="order-item">
                                                <span>{item.fabricId?.name} (x{item.quantity})</span>
                                                <span>₹{(item.fabricId?.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="order-total">
                                    <span>Total</span>
                                    <span>₹{currentFabric
                                        ? (currentFabric.fabricId?.price * currentFabric.quantity).toFixed(2)
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
                                                alert("Payment failed. Please try again.");
                                            }}
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