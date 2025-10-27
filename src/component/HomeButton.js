// src/components/HomeButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import './HomeButton.css';

function HomeButton() {
  const navigate = useNavigate();

  return (
    <button className="home-button" onClick={() => navigate('/dashboard')}>
      <Home size={20} style={{ marginRight: '6px' }} /> Home
    </button>
  );
}

export default HomeButton;
