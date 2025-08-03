import React from 'react';
import './PrivacyPolicy.css';
import { BASE_URL } from '../utils/config';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <h1>Privacy Policy</h1>
      <p>Last updated: July 2025</p>

      <h2>1. Introduction</h2>
      <p>Welcome to Amoryn. Your privacy is important to us. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our dating platform.</p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li><strong>Personal Information:</strong> Name, email, gender, age, photos, preferences, and bio.</li>
        <li><strong>Usage Data:</strong> IP address, browser type, device type, and interactions with the app.</li>
        <li><strong>Messages:</strong> Chats and video calls are securely transmitted and not shared publicly.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To create and manage your account</li>
        <li>To match you with compatible users</li>
        <li>To improve user experience</li>
        <li>To detect and prevent fraud or abuse</li>
        <li>To send important updates or offers</li>
      </ul>

      <h2>4. Sharing Your Information</h2>
      <p>We do not sell your personal data. We may share information with trusted service providers (e.g., payment gateways) who assist in operating our platform, but only under strict data protection agreements.</p>

      <h2>5. Your Rights</h2>
      <ul>
        <li>You can access, edit, or delete your data at any time from your profile settings.</li>
        <li>You can request account deletion by contacting <a href="mailto:support@amoryn.com">support@amoryn.com</a>.</li>
      </ul>

      <h2>6. Cookies and Tracking</h2>
      <p>We may use cookies to enhance site performance and analytics. You can control cookie settings through your browser.</p>

      <h2>7. Data Security</h2>
      <p>We use encryption and secure servers to protect your personal data. However, no method of transmission over the internet is 100% secure.</p>

      <h2>8. Children’s Privacy</h2>
      <p>Amoryn is strictly for users aged 18 and above. We do not knowingly collect data from anyone under 18.</p>

      <h2>9. Changes to This Policy</h2>
      <p>We may update this policy. If so, we’ll notify users via email or through the app.</p>

      <h2>10. Contact Us</h2>
      <p>If you have any questions or concerns about your privacy, contact us at <a href="mailto:support@amoryn.com">support@amoryn.com</a>.</p>
    </div>
  );
};

export default PrivacyPolicy;
