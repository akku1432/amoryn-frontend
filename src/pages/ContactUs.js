// src/ContactUs.js
import React from 'react';
import './ContactUs.css';

const ContactUs = () => (
  <div className="contact-container">
    <h1 className="contact-title">Contact Us</h1>
    <p className="contact-description">
      We're here to help and answer any questions you might have. Whether you're experiencing issues with your account, payments, or simply want to share feedback, feel free to reach out.
    </p>

    <div className="contact-section">
      <h2>General Inquiries</h2>
      <p>
        For general support, suggestions, or questions, email us at:{" "}
        <a href="mailto:support@amoryn.in">support@amoryn.in</a>
      </p>
    </div>

    <div className="contact-section">
      <h2>Business or Partnerships</h2>
      <p>
        For collaboration opportunities, business inquiries, or media/press communication, contact:{" "}
        <a href="mailto:partnerships@amoryn.in">partnerships@amoryn.in</a>
      </p>
    </div>

    <div className="contact-section">
      <h2>Support Hours</h2>
      <p>
        Our support team is available from Monday to Friday, 10:00 AM – 6:00 PM IST.
        <br />
        We aim to respond within 1–2 business days.
      </p>
    </div>

    <p className="last-updated">Last updated: August 3, 2025</p>
  </div>
);

export default ContactUs;
