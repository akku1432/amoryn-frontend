import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { BASE_URL } from './utils/config';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      setMessage('Login successful');
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="logo">Amoryn</div>
      <p className="quote">“Where hearts connect, stories begin.”</p>
      <h2>Login</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <div className="auth-options">
        <p>New user? <Link to="/signup">Signup</Link></p>
        <p><Link to="/forgot-password">Forgot Password?</Link></p>
      </div>
    </div>
  );
}

export default Login;