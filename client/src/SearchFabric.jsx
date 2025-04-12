import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaCartPlus, FaSearch, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import "./SearchFabric.css";
import './LogoutButton.css';
import { FaSignOutAlt } from "react-icons/fa";

const SearchFabric = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fabrics, setFabrics] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialFabrics = async () => {
      try {
        const response = await axios.get("http://localhost:5000/fabrics");
        setFabrics(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching initial fabrics:", error);
        setError("Failed to load fabrics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialFabrics();
  }, []);

  useEffect(() => {
    if (activeSearchTerm === "") {
      setLoading(true);
      axios.get("http://localhost:5000/fabrics")
        .then(response => {
          setFabrics(response.data);
          setError(null);
        })
        .catch(error => {
          console.error("Error fetching fabrics:", error);
          setError("Failed to load fabrics. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    setLoading(true);
    axios.get("http://localhost:5000/fabrics/search", {
      params: { q: activeSearchTerm }
    })
    .then((response) => {
      setFabrics(response.data);
      setError(null);
    })
    .catch((error) => {
      console.error("Error searching fabrics:", error);
      setError("Failed to search fabrics. Please try again.");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [activeSearchTerm]);

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
  };

  const onInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filteredSuggestions = fabrics.filter(
        (fabric) =>
          (fabric.name && fabric.name.toLowerCase().includes(value.toLowerCase())) ||
          (fabric.color && fabric.color.toLowerCase().includes(value.toLowerCase()))
      );
      setSuggestions(filteredSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
        setActiveSearchTerm(transcript);

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

  const handleAddFavorite = async (fabricId) => {
    if (!userEmail) {
      alert("Please log in to add fabrics to favorites.");
      navigate('/login');
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:5000/favorites", { 
        email: userEmail, 
        fabricId 
      });
      
      alert(response.data.message || "Fabric added to favorites!");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert(error.response?.data.message || "Failed to add to favorites.");
    }
  };

  const handleAddToCart = async (fabric) => {
    if (!userEmail) {
      alert("Please log in to add items to your cart.");
      navigate('/login');
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/cart", {
        email: userEmail,
        fabricId: fabric._id,
        fabricName: fabric.name,
        imageUrl: fabric.imageUrl,
        color: fabric.color,
        price: fabric.price,
        description: fabric.description,
        quantity: 1 // Default quantity
      });
      
      alert(response.data.message || "Item added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data.message || "Failed to add to cart.");
    }
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

      <div className="search-bar-container">
        <FaSearch className="search-icon" onClick={handleSearch} />
        <input
          type="text"
          placeholder="Search by name or color"
          value={searchTerm}
          onChange={onInputChange}
          onKeyPress={handleKeyPress}
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
                  setActiveSearchTerm(suggestion.name || suggestion.color);
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

      {error && <div className="error-message">{error}</div>}

      <div className="fabric-list">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading fabrics...</p>
          </div>
        ) : fabrics.length === 0 ? (
          <p className="no-fabrics">No fabrics found matching your search.</p>
        ) : (
          fabrics.map((fabric) => (
            <div key={fabric._id} className="fabric-card">
              {fabric.imageUrl && (
                <img
                  src={fabric.imageUrl}
                  alt={fabric.name}
                  className="fabric-image"
                />
              )}
              <div className="fabric-details">
                <h3>{fabric.name}</h3>
                <p><strong>Color:</strong> {fabric.color}</p>
                <p><strong>Price:</strong> ₹{fabric.price} per meter</p>
                <p><strong>Description:</strong> {fabric.description}</p>
              </div>
              <div className="action-buttons">
                <button 
                  className="favorite-button"
                  onClick={() => handleAddFavorite(fabric._id)}
                >
                  <FaHeart className="fav-icon" />
                </button>
                <button 
                  className="cart-button"
                  onClick={() => handleAddToCart(fabric)}
                >
                  <FaCartPlus className="cart-icon" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchFabric;