import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import "./Search.css";
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon
import './LogoutButton.css'; // Optional: Add specific styles for the div

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fabrics, setFabrics] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const apiUrl = "https://your-api-endpoint.com/fabrics"; // Update API endpoint

  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => {
        setFabrics(response.data);
      })
      .catch((error) => {
        console.error("Error fetching fabrics:", error);
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

  const calculateProgress = () => {
    const maxChars = 20;
    const progress = Math.min((searchTerm.length / maxChars) * 100, 100);
    return `${progress}%`;
  };

  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.log("Browser does not support voice search.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    if (!isListening) {
      // Start voice recognition
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
      };

      recognition.onspeechend = () => {
        recognition.stop();
        setIsListening(false);
      };
    } else {
      // Stop voice recognition
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
          <Link to="/AdminDashboard">Home</Link>
          <Link to="/manage-fabric">Manage Fabrics</Link>
          <Link to="/search">Search</Link>
          <Link to="/view-orders">View Orders</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>

      <div className="search-bar-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-bar"
          placeholder="Search by name or color"
          value={searchTerm}
          onChange={onInputChange}
          style={{
            background: `linear-gradient(to right, rgb(251, 252, 251) ${calculateProgress()}, #fff ${calculateProgress()})`,
          }}
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
                onClick={(e) => {
                  setSearchTerm(suggestion.name || suggestion.color);
                  setSuggestions([]);
                  e.target.blur();
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
        {fabrics.length === 0 ? (
          <div className="no-fabrics-message">
            <img
              src="/placeholder.jpg" // Add a placeholder image
              alt="No fabrics found"
              className="placeholder-image"
            />
            <p>No fabrics available. Add a fabric to get started!</p>
          </div>
        ) : filteredFabrics.length === 0 ? (
          <div className="no-fabrics-message">
            <img
              src="/placeholder.jpg" // Add a placeholder image
              alt="No fabrics found"
              className="placeholder-image"
            />
            <p>No fabrics found matching your search.</p>
          </div>
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
                <strong>Color:</strong> {fabric.color}
              </p>
              <p>
                <strong>Price:</strong> ₹{fabric.price} per meter
              </p>
              <p>
                <strong>Description:</strong> {fabric.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Search;