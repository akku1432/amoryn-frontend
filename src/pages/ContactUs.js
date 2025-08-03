// src/ContactUs.js
import React from 'react';
import './ContactUs.css';

const ContactUs = () => (
  <div className="p-6 max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold text-pink-600 mb-4">Contact Us</h1>
    <p className="mb-4">We’d love to hear from you. Here’s how you can reach us:</p>
    <ul className="text-gray-700 space-y-2">
      <li>Email: <strong>support@amoryn.in</strong></li>
    </ul>
  </div>
);

export default ContactUs;
