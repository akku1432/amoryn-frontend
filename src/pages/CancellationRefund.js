// src/CancellationRefund.js
import React from 'react';
import './CancellationRefund.css';

const CancellationRefund = () => (
  <div className="p-6 max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold text-pink-600 mb-4">Cancellation & Refund Policy</h1>
    <p className="mb-4">We understand that sometimes plans change. Here's our policy:</p>
    <ul className="list-disc ml-5 text-gray-700 space-y-2">
      <li><strong>We do not offer any subscription cancellation.</strong>
      We do not offer refunds for partially used subscription periods.
     Refunds may be provided in the case of duplicate charges or technical issues, upon review.
      To request cancellation or refund, contact us at <strong>support@amoryn.in</strong></li>.
    </ul>
  </div>
);

export default CancellationRefund;
