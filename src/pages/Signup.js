import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../utils/config';
import './Signup.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    dob: '',
    lookingFor: '',
    password: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isAbove18 = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    return age > 18 || (age === 18 && m >= 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAbove18(formData.dob)) {
      setMessage('You must be at least 18 years old to sign up.');
      return;
    }

    if (!acceptTerms) {
      setMessage('You must accept the Terms and Conditions to continue.');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/signup`, formData);
      setMessage('Signup successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <div className="logo">Amoryn</div>
      <p className="quote">“Where hearts connect, stories begin.”</p>
      <h2>Signup</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <select name="gender" onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input type="date" name="dob" onChange={handleChange} required />
        <select name="lookingFor" onChange={handleChange} required>
          <option value="">Looking For</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="both">Both</option>
        </select>
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

        <div className="terms-checkbox">
          <input
            name="checkbox"
            type="checkbox"
            id="terms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          <label htmlFor="terms" name="terms">
            I agree to the <Link to="/terms" target="_blank">Terms and Conditions</Link>
          </label>
        </div>

        <button type="submit" name='button'>Signup</button>
      </form>
    </div>
  );
}

export default Signup;
