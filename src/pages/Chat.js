import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import './Chat.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { SocketContext } from '../SocketContext';
import { Video, Home, X } from 'lucide-react';
import { BASE_URL } from '../utils/config';

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [chatNotifications, setChatNotifications] = useState({}); // { userId: count }

  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const socket = useContext(SocketContext);

  // Scroll messages to bottom on new message received or sent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch user's premium status
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setIsPremium(res.data.isPremium || false))
      .catch((err) => console.error('Failed to fetch status:', err));
  }, [token]);

  // Fetch conversations (chat users) AND initialize unread notifications
  useEffect(() => {
    axios
       .get(`${BASE_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let users = res.data;

        // If redirected to chat with a specific user
        if (location.state?.userId && location.state?.userName) {
          const user = {
            _id: location.state.userId,
            name: location.state.userName,
            photo: '',
          };
          if (!users.some((u) => u._id === user._id)) {
            users = [user, ...users];
          }
          setSelectedUser(user);

          if (location.state.initiatingCall) {
            navigate(`/video-call?userId=${user._id}&userName=${user.name}`);
          }
        } else if (users.length > 0 && !selectedUser) {
          setSelectedUser(users[0]);
        }

        setConversations(users);
      })
      .catch((err) => console.error('Failed to load conversations:', err));

    // NEW: Fetch unread messages count per user to initialize notifications
    axios
         .get(`${BASE_URL}/api/chat/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setChatNotifications(res.data || {});
      })
      .catch((err) => {
        console.error('Failed to load unread counts:', err);
      });
  }, [token, location, socket, navigate, selectedUser]);

  // Fetch messages for selected user and clear notifications for that user
  useEffect(() => {
    if (!selectedUser) return;

    axios
      .get(`${BASE_URL}/api/chat/messages/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMessages(res.data);
        setChatNotifications((prev) => {
          const newNotifications = { ...prev };
          delete newNotifications[selectedUser._id];
          return newNotifications;
        });
      })
      .catch((err) => console.error('Failed to load messages:', err));
  }, [selectedUser, token]);

  // Listen for incoming socket messages to update notifications or messages list
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (data) => {
      console.log("Chat page received 'new-message':", data);
      if (selectedUser && selectedUser._id === data.from) {
        setMessages((prev) => [
          ...prev,
          { fromSelf: false, message: data.message, timestamp: new Date().toISOString() },
        ]);
      } else {
        setChatNotifications((prev) => ({
          ...prev,
          [data.from]: (prev[data.from] || 0) + 1,
        }));
      }
    };

    socket.on('new-message', handleIncomingMessage);

    return () => {
      socket.off('new-message', handleIncomingMessage);
    };
  }, [socket, selectedUser]);

  // Sending a new message - disabled for non-premium users
  const sendMessage = async () => {
    if (!isPremium) {
      setDialogMessage('Messaging is only available for Premium members.');
      setShowDialog(true);
      return;
    }
    if (!newMessage.trim() || !selectedUser?._id) return;

    try {
       const res = await axios.post(
        `${BASE_URL}/api/chat/send`,
        { to: selectedUser._id, message: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            fromSelf: true,
            message: newMessage.trim(),
            timestamp: new Date().toISOString(),
          },
        ]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err.response?.data || err.message);
    }
  };

  // Video call - disabled for non-premium users
  const handleVideoCall = () => {
    if (!isPremium) {
      setDialogMessage('Video call is only available for Premium members.');
      setShowDialog(true);
      return;
    }
    if (!selectedUser) return;
    navigate(`/video-call?userId=${selectedUser._id}&userName=${selectedUser.name}`);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setDialogMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-top">
          <Home
            size={24}
            color="#fff"
            style={{ cursor: 'pointer' }}
            title="Go to Dashboard"
            onClick={() => navigate('/dashboard')}
          />
        </div>
        {conversations.length === 0 && <div className="chat-placeholder">No Conversations Yet</div>}
        {conversations.map((user) => (
          <div
            key={user._id}
            className={`chat-user ${selectedUser?._id === user._id ? 'active' : ''}`}
            onClick={() => setSelectedUser(user)}
          >
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="user-avatar" />
            ) : (
              <div className="user-avatar default-avatar" />
            )}
            <strong className="user-name">{user.name}</strong>
            {chatNotifications[user._id] > 0 && (
              <span className="notification-badge">
                {chatNotifications[user._id] > 99 ? '99+' : chatNotifications[user._id]}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="chat-window">
        {!selectedUser && <div className="chat-placeholder">Select a user to start chatting</div>}
        {selectedUser && (
          <>
            <div className="chat-header">
              <span>Chat with {selectedUser.name}</span>
              <button
                className="video-call-icon"
                onClick={handleVideoCall}
                disabled={!isPremium}
                title={!isPremium ? 'Upgrade to Premium for video calls' : 'Video Call'}
              >
                <Video size={20} />
              </button>
            </div>
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.fromSelf ? 'sent' : 'received'}`}>
                  <div>{msg.message}</div>
                  <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder={isPremium ? 'Type your message...' : 'Messaging is for Premium users only.'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={!isPremium}
              />
              <button onClick={sendMessage} disabled={!isPremium}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <button className="close-btn" onClick={closeDialog}>
              <X size={18} />
            </button>
            <h2>Premium Feature</h2>
            <p>{dialogMessage}</p>
            <button className="upgrade-btn" onClick={() => navigate('/subscription')}>
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
