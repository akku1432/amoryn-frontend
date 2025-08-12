// src/Faq.js
import React from 'react';
import './Faq.css';
import { Link, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const Faq = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="text-4xl font-bold text-pink-600">Frequently Asked Questions</h1>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="home-button"
          style={{
            background: '#ec294d',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            transition: 'background 0.2s ease'
          }}
        >
          <Home size={20} />
          Home
        </button>
      </div>

      <div className="space-y-4 text-gray-800">
        <div>
          <h2 className="text-xl font-semibold">What is Amoryn?</h2>
          <p>Amoryn is a dating and relationship app designed to help people connect for love, friendship, and companionship.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">How do I cancel my subscription?</h2>
          <p>You can find full details on our <Link to="/cancellation-refund" className="text-pink-600 underline">Cancellation & Refund Policy</Link> page.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">How is my data used?</h2>
          <p>Check out our <Link to="/privacy" className="text-pink-600 underline">Privacy Policy</Link> for information on how we protect your data.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">What are the terms of using Amoryn?</h2>
          <p>Please read our <Link to="/terms" className="text-pink-600 underline">Terms & Conditions</Link> for more details.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Shipping & Delivery Policy ?</h2>
          <p>Please read our <Link to="/shipping" className="text-pink-600 underline">Shipping & Delivery Policy</Link> for more details.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Need help?</h2>
          <p>You can always <Link to="/contact-us" className="text-pink-600 underline">contact us</Link> for any other support questions.</p>
        </div>
      </div>
    </div>
  );
};

export default Faq;