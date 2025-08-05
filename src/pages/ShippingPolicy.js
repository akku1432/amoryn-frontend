// src/ShippingPolicy.js
import React from 'react';
import './ShippingPolicy.css';

const ShippingPolicy = () => {
  return (
    <div className="shipping-policy-container p-6 max-w-3xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold text-pink-600 mb-4">Shipping & Delivery Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: August 5, 2025</p>

      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">1. Nature of Services</h2>
      <p className="mb-4">
        Amoryn is an entirely digital platform that offers online dating services such as premium memberships, virtual coins, and other digital interactions. As such, we do not ship or deliver any physical goods.
      </p>

      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">2. Delivery Method & Timeline</h2>
      <p className="mb-4">
        After a successful transaction through our payment gateway (CCBill), access to the purchased digital services is granted automatically and immediately. In some rare instances, technical processing may cause a short delay, in which case services will be activated within 24 hours.
      </p>

      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">3. Non-Delivery of Digital Services</h2>
      <p className="mb-4">
        If you do not receive access to your purchased service within the expected time frame, please contact our support team at <strong>support@amoryn.in</strong> with your payment confirmation or transaction ID. We will verify and resolve your issue promptly.
      </p>

      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">4. Contact Information</h2>
      <p className="mb-4">
        For any concerns or inquiries related to the delivery of our digital services, feel free to reach out to us via email at <strong>support@amoryn.in</strong>.
      </p>

      <p className="mt-6 text-sm text-gray-500">Thank you for choosing Amoryn — where meaningful connections begin.</p>
    </div>
  );
};

export default ShippingPolicy;
