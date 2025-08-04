// src/ContactUs.js
import React from 'react';
import './ContactUs.css';

const ContactUs = () => (
  <div className="contact-container">
    <h1 className="contact-title">Contact Us</h1>
    <p className="contact-description">
      We're here to help and answer any questions you might have. Whether you're experiencing issues or simply want to share feedback, feel free to reach out.
    </p>

    <div className="contact-section">
      <h2>General Inquiries</h2>
      <p>Email us at: <a href="mailto:support@amoryn.in">support@amoryn.in</a></p>
    </div>

    <div className="contact-section">
      <h2>Business or Partnership</h2>
      <p>For partnerships, collaborations, or press inquiries, reach us at: <a href="mailto:partnerships@amoryn.in">partnerships@amoryn.in</a></p>
    </div>

    <div className="contact-section">
      <h2>Support Hours</h2>
      <p>Monday to Friday: 10:00 AM – 6:00 PM IST<br/>Response time: Within 1–2 business days</p>
    </div>

    <p className="last-updated">Last updated: August 3, 2025</p>
  </div>
);

export default ContactUs;
