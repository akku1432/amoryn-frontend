import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { SocketContext } from './SocketContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Match from './pages/Match';
import Chat from './pages/Chat';
import VideoCall from './pages/VideoCall';
import Friends from './pages/Friends';
import Subscription from './pages/Subscription'; // ✅ Added subscription page
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Faq from './pages/Faq';
import ContactUs from './pages/ContactUs';
import CancellationRefund from './pages/CancellationRefund';
import { BASE_URL } from './utils/config';

const socket = io(`${BASE_URL}`);

function App() {
  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (userId) {
      socket.emit('register-user', userId);
    }

    socket.on('like-notification', ({ from }) => {
      if (Notification.permission === 'granted') {
        new Notification('You got a new like! 💖', {
          body: `${from} liked your profile!`,
        });
      } else {
        alert(`${from} liked your profile! 💖`);
      }
    });

    return () => {
      socket.off('like-notification');
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/match" element={<Match />} />
          <Route path="/chats" element={<Chat />} />
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/subscription" element={<Subscription />} /> {/* ✅ Premium route */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/Faq" element={<Faq />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/cancellation-refund" element={<CancellationRefund />} />
        </Routes>
      </Router>
    </SocketContext.Provider>
  );
}

export default App;
