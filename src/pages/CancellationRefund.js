// src/CancellationRefund.js
import React from 'react';
import './CancellationRefund.css';

const CancellationRefund = () => (
  <div className="p-6 max-w-3xl mx-auto text-gray-800">
    <h1 className="text-3xl font-bold text-pink-600 mb-4">Cancellation & Refund Policy</h1>
    
    <p className="mb-4">
      At Amoryn, we strive to deliver a seamless and secure digital experience. Please read this policy carefully before making any payments or subscribing to our services.
    </p>

    <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">1. Cancellation Policy</h2>
    <p className="mb-4">
      Once a subscription or digital purchase has been made, cancellations are not permitted. We do not offer partial cancellations, pausing of subscriptions, or pro-rata adjustments under any circumstances.
    </p>

    <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">2. Refund Policy</h2>
    <p className="mb-2">
      As our services are digital and access is provided immediately after payment, refunds are generally not issued. However, a refund may be considered in the following exceptional cases:
    </p>
      <p>Duplicate payment or accidental overcharging</p>
      <p>Technical errors that prevent access to services (after review)</p>
   
    <p className="mb-4">
      Refund requests must be submitted within <strong>7 days</strong> of the transaction date. Approved refunds will be processed within 7–10 business days.
    </p>

    <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-2">3. How to Request a Refund</h2>
    <p className="mb-4">
      To initiate a refund request, contact our support team at <strong>support@amoryn.in</strong> with the following details:
    </p>
    
      <p>Registered email address</p>
      <p>Transaction ID or payment receipt</p>
      <p>Reason for the refund request</p>
  
    <p>
      Our team will review your request and respond within 3–5 business days.
    </p>

    <p className="mt-6 text-sm text-gray-500">Last updated: August 3, 2025</p>
  </div>
);

export default CancellationRefund;
