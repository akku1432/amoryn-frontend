import React, { useEffect, useState } from 'react';
import './Subscription.css';
import { Crown, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { BASE_URL } from '../utils/config';

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  // Plans in USD
  const plans = [
    {
      name: 'Monthly',
      description: 'Unlimited matches & chats for 30 days',
      price: 3.0, // USD
    },
    {
      name: 'Yearly',
      description: '1-year access to all premium features',
      price: 32.0, // USD
    },
  ];

  useEffect(() => {
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePayPalApprove = async (planType) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${BASE_URL}/api/user/subscribe`,
        { plan: planType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.subscription) {
        setSubscription(res.data.subscription);
      }
    } catch (err) {
      console.error('Subscription saving failed:', err);
      alert('Payment succeeded but subscription update failed.');
    }
  };

  return (
    <div className="subscription-container">
      <div className="subscription-home-button" onClick={() => navigate('/dashboard')}>
        <Home size={20} /> Home
      </div>

      <div className="subscription-header">
        <h2>Unlock Premium Features</h2>
        <p>Pay in USD via PayPal — global support</p>
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
              <p className="plan-price">${plan.price.toFixed(2)}</p>
              {selectedPlan === plan.name ? (
                <PayPalButtons
                  style={{ layout: 'vertical' }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            value: plan.price.toFixed(2),
                            currency_code: 'USD',
                          },
                          description: `${plan.name} Plan`,
                        },
                      ],
                    });
                  }}
                  onApprove={async (data, actions) => {
                    await actions.order.capture();
                    await handlePayPalApprove(plan.name.toLowerCase());
                    alert('✅ Payment successful via PayPal!');
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err);
                    alert('❌ PayPal payment failed.');
                  }}
                />
              ) : (
                <button
                  className="subscribe-btn"
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  Subscribe
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscription;
