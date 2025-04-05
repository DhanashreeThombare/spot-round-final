import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Import the shared CSS file

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const res = await axios.post('https://spot-round-final.onrender.com/signup', { username, password });
      alert(res.data.message);
      navigate('/login'); // Redirect to the login page after signup
    } catch (error) {
      setError('Error creating admin.');
    }
  };

  return (
    <div className="container">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>
      <div className="form-box">
        <h2>Admin Signup</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="input-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            autocomplete="off"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            autocomplete="off"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn" onClick={handleSignup}>Signup</button>
      </div>
    </div>
  );
}

export default Signup;
