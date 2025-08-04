// src/ShippingPolicy.js
import React from 'react';
import './ShippingPolicy.css';

const ShippingPolicy = () => {
  return (
    <div className="shipping-policy-container">
      <h1>Shipping & Delivery Policy</h1>
      <p>Last updated: May 13, 2025</p>

      <h2>1. Nature of Services</h2>
      <p>
        Amoryn is a digital-only platform providing online dating services, including premium memberships and virtual coins. No physical products are shipped or delivered.
      </p>

      <h2>2. Delivery Method & Timeline</h2>
      <p>
        Upon successful payment, access to purchased digital services (e.g., premium features) is granted immediately. In rare cases of technical delays, please allow up to 24 hours.
      </p>

      <h2>3. Non-Delivery of Digital Services</h2>
      <p>
        If you do not receive access after successful payment, contact our support team at <a href="mailto:support@amoryn.in">support@amoryn.in</a> with payment details. We will resolve the issue promptly.
      </p>

      <h2>4. Contact</h2>
      <p>
        For any shipping or delivery-related queries, email us at <a href="mailto:support@amoryn.in">support@amoryn.in</a>.
      </p>
    </div>
  );
};

export default ShippingPolicy;
