// Subscription.js
import React, { useEffect, useState } from 'react';
import './Subscription.css';
import { Crown, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from './utils/config';
const Subscription = () => {
  const [userCurrency, setUserCurrency] = useState('INR');
  const [conversionRate, setConversionRate] = useState(1);
  const [symbol, setSymbol] = useState('₹');
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const navigate = useNavigate();

  const plans = [
    {
      name: 'Monthly',
      description: 'Unlimited matches & chats for 30 days',
      price: 199,
      isPremium: true,
    },
    {
      name: 'Yearly',
      description: '1-year access to all premium features',
      price: 699,
      isPremium: true,
    },
  ];

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        const currencyCode = data.currency || 'INR';
        setUserCurrency(currencyCode);
        fetch(`https://api.exchangerate.host/latest?base=INR`)
          .then((res) => res.json())
          .then((rateData) => {
            const rate = rateData.rates[currencyCode] || 1;
            setConversionRate(rate);
            setSymbol(getCurrencySymbol(currencyCode));
          })
          .catch(() => {
            setConversionRate(1);
            setSymbol('₹');
          });
      });

    if (!document.querySelector('#razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayReady(true);
      script.onerror = () => console.error('Failed to load Razorpay');
      document.body.appendChild(script);
    } else {
      setRazorpayReady(true);
    }

    fetchActivePlan();
  }, []);

  const fetchActivePlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.subscription) {
        setSubscription(res.data.subscription);
      }
    } catch (err) {
      console.error('Failed to fetch active plan:', err);
    }
  };

  const getCurrencySymbol = (code) => {
    const symbols = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AUD: 'A$',
      CAD: 'C$',
      JPY: '¥',
    };
    return symbols[code] || code;
  };

  const formatPrice = (priceInINR) => {
    const localPrice = (priceInINR * conversionRate).toFixed(2);
    return `${symbol}${localPrice}`;
  };

  const handlePayment = (amountINR, note) => {
    if (!razorpayReady || typeof window.Razorpay !== 'function') {
      alert('Razorpay is not ready yet. Please wait a moment and try again.');
      return;
    }

    const planType = note.toLowerCase().includes('monthly')
      ? 'monthly'
      : note.toLowerCase().includes('yearly')
      ? 'yearly'
      : null;

    const token = localStorage.getItem('token');
    const options = {
      key: 'rzp_test_Rpneo8pLUN0fHF',
      amount: amountINR * 100,
      currency: 'INR',
      name: 'MatchMingle',
      description: note,
      handler: async function (response) {
        alert(`✅ Payment successful!\nPayment ID: ${response.razorpay_payment_id}`);
        if (planType) {
          try {
            const result = await axios.post(
              `${BASE_URL}/api/user/subscribe`,
              { plan: planType },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (result.data.subscription) {
              setSubscription(result.data.subscription);
            }
          } catch (err) {
            console.error('Failed to save subscription:', err);
            alert('Payment succeeded but subscription save failed.');
          }
        }
      },
      theme: { color: '#3498db' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="subscription-container">
      <div className="subscription-home-button" onClick={() => navigate('/dashboard')}>
        <Home size={20} /> Home
      </div>

      <div className="subscription-header">
        <h2>Unlock Premium Features</h2>
        <p>Prices shown in your local currency for your convenience</p>
      </div>

      {subscription ? (
        <div className="plan-grid">
          <div className="plan-card active-card">
            <Crown className="premium-icon" />
            <h3>Current Plan: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}</h3>
            <p>Start: {formatDate(subscription.startDate)}</p>
            <p>End: {formatDate(subscription.endDate)}</p>
            <p style={{ color: 'green', fontWeight: 'bold' }}>🟢 Status: Active</p>
          </div>
        </div>
      ) : (
        <div className="plan-grid">
          {plans.map((plan, idx) => (
            <div className="plan-card" key={idx}>
              <Crown className="premium-icon" />
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <p className="plan-price">{formatPrice(plan.price)}</p>
              <button
                className="subscribe-btn"
                onClick={() => handlePayment(plan.price, `${plan.name} Plan`)}>
                Subscribe
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscription;
