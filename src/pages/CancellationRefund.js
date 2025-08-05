// src/CancellationRefund.js
import React from 'react';
import './CancellationRefund.css';

const CancellationRefund = () => (
  <div className="p-6 max-w-3xl mx-auto text-gray-800">
    <h1 className="text-3xl font-bold text-pink-600 mb-4">Cancellation & Refund Policy</h1>

    <p className="mb-4">
      At Amoryn, we are committed to providing a smooth, secure, and transparent digital experience. This policy outlines the terms related to cancellations and refunds for any services purchased through our platform using our payment partner, CCBill. By making a purchase or subscribing to any plan, you agree to the terms outlined below.
    </p>

    <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">1. Cancellation Policy</h2>
    <p className="mb-4">
      Once a subscription or digital service has been successfully purchased, cancellations are not permitted. We do not support cancellations for partially used services, paused subscriptions, or mid-cycle terminations. All purchases are considered final, and users are advised to review their selected plan carefully before proceeding with payment.
    </p>

    <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">2. Refund Policy</h2>
    <p className="mb-2">
      As our offerings are digital and access is granted instantly upon successful payment, we generally do not issue refunds. However, in exceptional cases, we may consider a refund request if the following conditions apply:
    </p>

    <p>There was a duplicate payment or an accidental overcharge.</p>
    <p>A verified technical issue occurred that prevented access to the service.</p>

    <p className="mb-4">
      Refund requests must be submitted within <strong>7 days</strong> of the original transaction. All eligible refunds, once approved, will be processed within 7 to 10 business days through the original payment method.
    </p>

    <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-2">3. How to Request a Refund</h2>
    <p className="mb-4">
      If you believe you are eligible for a refund, please contact our support team at <strong>support@amoryn.in</strong>. Kindly include the following information to ensure a smooth and timely review process:
    </p>

    <p>Your registered email address associated with your Amoryn account.</p>
    <p>The transaction ID or payment confirmation receipt from CCBill.</p>
    <p>A brief explanation of the issue and reason for the refund request.</p>

    <p>
      Our team will evaluate the request and respond within 3 to 5 business days. Refund decisions are made at our sole discretion based on the validity and circumstances of the claim.
    </p>

    <p className="mt-6 text-sm text-gray-500">Last updated: August 5, 2025</p>
  </div>
);

export default CancellationRefund;
