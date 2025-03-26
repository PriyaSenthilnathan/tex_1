import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaCartPlus, FaSearch, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import "./SearchFabric.css";
import './LogoutButton.css'; // Optional: Add specific styles for the div
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon

const SearchFabric = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fabrics, setFabrics] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://your-api-endpoint.com/fabrics") // Update API endpoint
      .then((response) => {
        setFabrics(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching fabrics:", error);
        setLoading(false);
        alert("Failed to load fabrics. Please try again later.");
      });
  }, []);

  const onInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filteredSuggestions = fabrics.filter(
        (fabric) =>
          (fabric.name &&
            fabric.name.toLowerCase().includes(value.toLowerCase())) ||
          (fabric.color &&
            fabric.color.toLowerCase().includes(value.toLowerCase()))
      );
      setSuggestions(filteredSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Browser does not support voice search.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);

        const filteredSuggestions = fabrics.filter(
          (fabric) =>
            (fabric.name &&
              fabric.name.toLowerCase().includes(transcript.toLowerCase())) ||
            (fabric.color &&
              fabric.color.toLowerCase().includes(transcript.toLowerCase()))
        );
        setSuggestions(filteredSuggestions.slice(0, 5));
      };

      recognition.onerror = () => {
        setIsListening(false);
        alert("Voice search failed. Please try again.");
      };

      recognition.onspeechend = () => {
        recognition.stop();
        setIsListening(false);
      };
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  const filteredFabrics = fabrics.filter(
    (fabric) =>
      (fabric.name &&
        fabric.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fabric.color &&
        fabric.color.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddFavorite = (fabricId) => {
    if (!userEmail) {
      alert("Please log in to add fabrics to favorites.");
      return;
    }
    axios
      .post("https://your-api-endpoint.com/favorites", { email: userEmail, fabricId }) // Update API endpoint
      .then((response) => {
        alert(response.data.message || "Fabric added to favorites!");
      })
      .catch((error) => {
        console.error("Error adding to favorites:", error);
        alert(error.response?.data.message || "Failed to add to favorites.");
      });
  };

  const handleAddToCart = (fabric) => {
    if (!userEmail) {
      alert("Please log in to add items to your cart.");
      return;
    }

    const payload = {
      email: userEmail,
      fabricId: fabric.id || fabric._id,
      fabricName: fabric.name,
      imageUrl: fabric.imageUrl,
      price: fabric.price,
    };

    axios
      .post("https://your-api-endpoint.com/cart", payload) // Update API endpoint
      .then((response) => {
        alert(response.data.message || "Item added to cart successfully!");
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        alert(error.response?.data.message || "Failed to add to cart.");
      });
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
          <Link to="/searchfabrics">Search Fabrics</Link>
          <Link to="/favorites">Favourites</Link>
          <Link to="/cart">Cart</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>

      <div className="search-bar-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by name or color"
          value={searchTerm}
          onChange={onInputChange}
          className="search-bar"
        />
        <div
          className="microphone-icon"
          onClick={handleVoiceSearch}
          title="Click to toggle voice search"
        >
          {isListening ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </div>
        {suggestions.length > 0 && (
          <ul className="autocomplete-suggestions">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion._id}
                onClick={() => {
                  setSearchTerm(suggestion.name || suggestion.color);
                  setSuggestions([]);
                }}
                className="suggestion-item"
              >
                {suggestion.name || suggestion.color}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fabric-list">
        {loading ? (
          <p>Loading fabrics...</p>
        ) : filteredFabrics.length === 0 ? (
          <p>No fabrics found.</p>
        ) : (
          filteredFabrics.map((fabric) => (
            <div key={fabric._id} className="fabric-card">
              {fabric.imageUrl && (
                <img
                  src={fabric.imageUrl}
                  alt={fabric.name}
                  className="fabric-image"
                />
              )}
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
              <div className="icon-container">
                <FaHeart
                  className="fav-icon"
                  title="Add to Favorites"
                  onClick={() => handleAddFavorite(fabric._id)}
                />
                <FaCartPlus
                  className="cart-icon"
                  title="Add to Cart"
                  onClick={() => handleAddToCart(fabric)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchFabric;