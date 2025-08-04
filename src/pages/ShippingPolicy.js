// src/ShippingPolicy.js
import React from 'react';
import './ShippingPolicy.css';

const ShippingPolicy = () => {
  return (
    <div className="shipping-policy-container">
      <h1>Shipping & Delivery Policy</h1>
      <p>Last updated: July 2025</p>

      <h2>1. Digital Services</h2>
      <p>
        Amoryn is an online dating platform offering digital services in the form of memberships, premium features, and virtual coins. As such, no physical products are shipped or delivered.
      </p>

      <h2>2. Delivery Timeline</h2>
      <p>
        Upon successful payment, access to premium features is granted immediately. In case of any delay due to technical issues, please allow up to 24 hours for service activation.
      </p>

      <h2>3. Non-Delivery of Services</h2>
      <p>
        If you do not receive access to the premium services after a successful transaction, please contact our support team at <a href="mailto:support@amoryn.in">support@amoryn.in</a> with proof of payment. We will investigate and resolve the issue promptly.
      </p>

      <h2>4. Contact Us</h2>
      <p>
        For any questions related to service delivery, please email us at <a href="mailto:support@amoryn.in">support@amoryn.in</a>.
      </p>
    </div>
  );
};

export default ShippingPolicy;
