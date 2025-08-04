// src/CancellationRefund.js
import React from 'react';
import './CancellationRefund.css';

const CancellationRefund = () => (
  <div className="p-6 max-w-3xl mx-auto text-gray-800">
    <h1 className="text-3xl font-bold text-pink-600 mb-4">Cancellation & Refund Policy</h1>
    
    <p className="mb-4">
      At Amoryn, we strive to deliver a satisfying and seamless digital experience. Please read our policy carefully before subscribing to any of our paid plans or services.
    </p>

    <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Cancellation Policy</h2>
    <p className="mb-4">
      Once a subscription or payment has been made, cancellations are not permitted. We do not offer partial cancellations or pro-rata adjustments.
    </p>

    <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Refund Policy</h2>
    
      <p>No refunds are provided for any digital subscription services once access has been granted.</p>
      <p>Refunds may be issued only in the following cases:</p>
          <p>Duplicate payment or accidental overcharging</p>
          <p>Technical errors that prevent access to services (subject to review)</p>
        
      <p>Refund requests must be made within <strong>7 days</strong> of the transaction date.</p>

    <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-2">How to Request a Refund</h2>
    <p className="mb-4">
      If you believe you qualify for a refund, please contact our support team at <strong>support@amoryn.in</strong> with your registered email, transaction ID, and a brief explanation. Our team will review your request and respond within 3–5 business days.
    </p>

    <p className="mt-6 text-sm text-gray-500">Last updated: August 3, 2025</p>
  </div>
);

export default CancellationRefund;
