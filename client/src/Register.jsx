import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './register.css';
import { FaUser, FaShoppingCart } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error message state
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleRegister = async () => {
    const { username, email, password, confirmPassword } = formData;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true); // Set loading state
    setError(''); // Clear any previous errors

    try {
      const response = await axios.post('http://localhost:5000/register', {
        username,
        email,
        password,
      }, {
        withCredentials: true
      });
      console.log('Server Response:', response.data);
      alert('Registration successful!');
      navigate('/'); // Redirect to homepage
    } catch (error) {
      console.error('Registration Error:', error);
      setError(error.response?.data?.message || 'This email is already registered.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleClose = () => navigate('/');

  return (
    <div>
      {/* Navbar */}
    <div className="navbar">
          <div className="website-name">SaraswathiTex</div>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/login"><FaUser /> Login</Link>
            <Link to="/cart"><FaShoppingCart /> Cart</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
    
    {/* Register Form */}
    <div className="page-background">
      <div className="register-container">
        <span className="close-button" onClick={handleClose}>&times;</span>
        <h1>Register</h1>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
        <button onClick={handleRegister} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p>
          Already have an account?{' '}
          <button onClick={() => navigate('/login')}>Login here</button>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Register;