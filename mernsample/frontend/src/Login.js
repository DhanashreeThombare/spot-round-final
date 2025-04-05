import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Login({ setIsAuthenticated }) {  // Receive setIsAuthenticated as prop
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // Loading state

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');  // Clear previous errors
    
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post('https://spot-round-final.onrender.com/api/admin/login', { 
        username, 
        password 
      });
      
      // Store token in localStorage (if using JWT)
      localStorage.setItem('authToken', res.data.token);
      
      // Update authentication state
      setIsAuthenticated(true);
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet" />
      <div className="form-box">
        <h2>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              autoComplete="off"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            className="btn" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
