import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';
import { BASE_URL } from '../utils/config';

function LoginModal({ onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '',
    name: '',
    dob: '',
    gender: '',
    lookingFor: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('token', res.data.token);
      setMessage('Login successful!');
      
      // Call success callback and close modal
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        if (res.data.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dob: formData.dob,
        gender: formData.gender,
        lookingFor: formData.lookingFor
      });
      
      setMessage('Account created! Please login.');
      
      // Switch to login form after successful registration
      setTimeout(() => {
        setIsLogin(true);
        setMessage('');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="login-modal-close" onClick={onClose}>×</span>
        
        <div className="login-modal-header">
          <h2>{isLogin ? 'Login to Continue' : 'Create Account'}</h2>
          <p>Join Amoryn to like profiles and connect with people</p>
        </div>

        {message && <p className={`login-modal-message ${message.includes('successful') || message.includes('created') ? 'success' : 'error'}`}>{message}</p>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="login-modal-form">
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange} 
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange} 
              required 
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="login-modal-form">
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              value={formData.name}
              onChange={handleChange} 
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange} 
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange} 
              required 
            />
            <input 
              type="date" 
              name="dob" 
              placeholder="Date of Birth" 
              value={formData.dob}
              onChange={handleChange} 
              required 
            />
            <select 
              name="gender" 
              value={formData.gender}
              onChange={handleChange} 
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select 
              name="lookingFor" 
              value={formData.lookingFor}
              onChange={handleChange} 
              required
            >
              <option value="">Looking For</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="both">Both</option>
            </select>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div className="login-modal-toggle">
          {isLogin ? (
            <p>
              Don't have an account? 
              <button onClick={() => {setIsLogin(false); setMessage('');}}>Sign Up</button>
            </p>
          ) : (
            <p>
              Already have an account? 
              <button onClick={() => {setIsLogin(true); setMessage('');}}>Login</button>
            </p>
          )}
        </div>

        {isLogin && (
          <div className="login-modal-forgot">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginModal;

