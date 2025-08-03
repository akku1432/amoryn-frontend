import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';
import { BASE_URL } from '../utils/config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
      setLink(res.data.resetLink);  // For testing
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleForgot}>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      <p>{message}</p>
      {link && (
        <div>
          <p>Reset Link (for testing):</p>
          <a href={link}>{link}</a>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
