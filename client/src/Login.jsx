import React, { useState } from 'react';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import './login.css';
import googleLogo from './assets/google-logo.png'; // Ensure this path is correct

const provider = new GoogleAuthProvider();

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error state
  const navigate = useNavigate();

  // Email login handler using API
  const handleEmailLogin = async () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);
    setError(''); // Clear previous errors

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      }, {
        withCredentials: true // Important for sessions/cookies
      });
      localStorage.setItem('userEmail', email);
      console.log('Login successful!', response.data);
      if (email === 'admin@gmail.com' && password === 'admin@123') {
        navigate('/adminDashboard');
      } else {
        navigate('/userDashboard');
      }
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        setError('Email is not registered.');
      } else if (error.response?.status === 401) {
        setError('Invalid Credentials.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem('userEmail', user.email);

      console.log('Google Sign-In successful:', user);
      navigate('/userDashboard');
    } catch (error) {
      console.error('Google Sign-In Error:', error.code, error.message);
      setError('Google Sign-In failed: ' + error.message);
    }
  };

  const goToRegister = () => navigate('/register');
  const handleClose = () => navigate('/');

  return (
    <div className="page-background">
      <div className="login-container">
        <span onClick={handleClose}>&times;</span>
        <h1>Login</h1>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleEmailLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p>
          Don't have an account?{' '}
          <button onClick={goToRegister}>Register here</button>
        </p>
        <hr />
        <button className="google-sign-in" onClick={handleGoogleSignIn}>
          <img src={googleLogo} alt="Google Logo" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;