import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { FaPaypal, FaMoneyBillWave } from "react-icons/fa";
import axios from "axios";
import "./Payment.css";

const Payment = ({
  items,
  isSingleProduct = false,
  onSuccess,
  onCancel,
  defaultQuantity = 1,
}) => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    address: "",
    contact: "",
    quantity: defaultQuantity.toString(),
    paymentMethod: "PayPal",
  });
  const [orderProcessing, setOrderProcessing] = useState(false);

  const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: name === "quantity" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const calculateTotal = () => {
    if (isSingleProduct) {
      const price = items[0]?.price || items[0]?.fabricId?.price || 0;
      const quantity = parseInt(userDetails.quantity) || 1;
      return price * quantity;
    }
    return items.reduce((total, item) => {
      const price = item?.price || item?.fabricId?.price || 0;
      const quantity = item?.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const createOrderPayload = () => {
    if (isSingleProduct) {
      const item = items[0];
      return [
        {
          fabricId: item?._id || item?.fabricId?._id,
          fabricName: item?.name || item?.fabricId?.name,
          userEmail: localStorage.getItem("userEmail"),
          userName: userDetails.name,
          userAddress: userDetails.address,
          userContact: userDetails.contact,
          quantity: parseInt(userDetails.quantity) || 1,
          paymentMethod: userDetails.paymentMethod,
          totalPrice: calculateTotal(),
        },
      ];
    }
    return items.map((item) => ({
      fabricId: item?._id || item?.fabricId?._id,
      fabricName: item?.name || item?.fabricId?.name,
      userEmail: localStorage.getItem("userEmail"),
      userName: userDetails.name,
      userAddress: userDetails.address,
      userContact: userDetails.contact,
      quantity: item.quantity,
      paymentMethod: userDetails.paymentMethod,
      totalPrice: (item?.price || item?.fabricId?.price) * item.quantity,
    }));
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const handleSuccess = async (orderPayload) => {
  try {
    const endpoint = isSingleProduct ? 
      `${API_BASE_URL}/api/orders` : 
      `${API_BASE_URL}/api/orders/bulk`;
    
    const response = await axios.post(endpoint, orderPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Order error:", error);
    throw error;
  }
};

  const handleCashOnDelivery = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setOrderProcessing(true);
    try {
      const payload = createOrderPayload();
      await onSuccess(payload);
    } catch (error) {
      console.error("Order error:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setOrderProcessing(false);
    }
  };

  const validateForm = () => {
    if (!userDetails.name.trim()) {
      alert("Please enter your name");
      return false;
    }
    if (!userDetails.address.trim()) {
      alert("Please enter your address");
      return false;
    }
    if (!userDetails.contact.trim() || !/^\d{10,15}$/.test(userDetails.contact)) {
      alert("Please enter a valid phone number");
      return false;
    }
    if (isSingleProduct && (!userDetails.quantity || userDetails.quantity < 1)) {
      alert("Please enter a valid quantity");
      return false;
    }
    return true;
  };

  const createPayPalOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: calculateTotal().toFixed(2),
            currency_code: "USD",
            breakdown: {
              item_total: {
                value: calculateTotal().toFixed(2),
                currency_code: "USD",
              },
            },
          },
          items: items.map((item) => ({
            name: item?.name || item?.fabricId?.name,
            unit_amount: {
              value: (item?.price || item?.fabricId?.price).toFixed(2),
              currency_code: "USD",
            },
            quantity: isSingleProduct
              ? userDetails.quantity.toString()
              : item.quantity.toString(),
          })),
        },
      ],
    });
  };

  const onPayPalApprove = async (data, actions) => {
    try {
      await actions.order.capture();
      const payload = createOrderPayload().map((order) => ({
        ...order,
        paypalOrderId: data.orderID,
      }));
      await onSuccess(payload);
    } catch (error) {
      console.error("PayPal error:", error);
      alert("Payment processing failed. Please try again or use another method.");
    }
  };

  return (
    <div className="payment-container">
      <form onSubmit={userDetails.paymentMethod === "Cash on Delivery" ? handleCashOnDelivery : (e) => e.preventDefault()}>
        <div className="form-section">
          <h3 className="section-title">Shipping Details</h3>
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

          {isSingleProduct && (
            <div className="form-group">
              <label>Quantity *</label>
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
                  disabled={orderProcessing}
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
                  required
                  disabled={orderProcessing}
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
                  disabled={orderProcessing}
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3 className="section-title">Payment Method *</h3>
          <div className="payment-options">
            <label className={`payment-option ${userDetails.paymentMethod === "PayPal" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="PayPal"
                checked={userDetails.paymentMethod === "PayPal"}
                onChange={handleInputChange}
                disabled={orderProcessing}
                required
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
                required
              />
              <div className="payment-content">
                <FaMoneyBillWave className="payment-icon" />
                <span>Cash on Delivery</span>
              </div>
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Order Summary</h3>
          <div className="order-items">
            {isSingleProduct ? (
              <div className="order-item">
                <span>{items[0]?.name || items[0]?.fabricId?.name}</span>
                <span>
                  ₹{(
                    (items[0]?.price || items[0]?.fabricId?.price) *
                    parseInt(userDetails.quantity)
                  ).toFixed(2)}
                </span>
              </div>
            ) : (
              items.map((item) => (
                <div key={item?._id || item?.fabricId?._id} className="order-item">
                  <span>
                    {item?.name || item?.fabricId?.name} (x{item.quantity})
                  </span>
                  <span>
                    ₹{(
                      (item?.price || item?.fabricId?.price) *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="order-total">
            <span>Total</span>
            <span>₹{calculateTotal().toFixed(2)}</span>
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

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
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
  );
};

export default Payment;