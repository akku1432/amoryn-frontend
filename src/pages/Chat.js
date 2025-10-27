import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import './Chat.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { SocketContext } from '../SocketContext';
import { Video, Home, X, Send, Phone, MoreVertical } from 'lucide-react';
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
  const [userProfile, setUserProfile] = useState(null);

  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const socket = useContext(SocketContext);

  // Scroll messages to bottom on new message received or sent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch user's premium status and profile
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUserProfile(res.data);
        // Check if user has active subscription - use the isPremium field from backend
        const premiumStatus = res.data.isPremium || false;
        setIsPremium(premiumStatus);
      })
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
            photo: location.state.userPhoto || '', // Preserve photo if available
          };
          if (!users.some((u) => u._id === user._id)) {
            users = [user, ...users];
          }
          setSelectedUser(user);

          if (location.state.initiatingCall) {
            navigate(`/video-call?userId=${user._id}&userName=${user.name}`);
          }
        } else if (users.length > 0 && !selectedUser) {
          // Only set selectedUser if none is currently selected
          setSelectedUser(users[0]);
        }

        setConversations(users);
      })
      .catch((err) => {
        console.error('Failed to load conversations:', err);
        console.error('Error details:', err.response?.data || err.message);
      });

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
  }, [token, location, socket, navigate]); // Removed selectedUser dependency

  // Handle initial user selection when conversations are loaded
  useEffect(() => {
    if (conversations.length > 0 && !selectedUser) {
      const firstUser = conversations[0];
      setSelectedUser(firstUser);
    }
  }, [conversations, selectedUser]);

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
      setDialogMessage('Messaging is only available for Premium members. Upgrade to start chatting!');
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
      setDialogMessage('Video call is only available for Premium members. Upgrade to start video calling!');
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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Messages</h2>
          <div className="header-actions">
            <button 
              className="home-button"
              onClick={() => navigate('/dashboard')}
              title="Go to Dashboard"
            >
              <Home size={20} />
            </button>
          </div>
        </div>
        
        <div className="conversations-list">
          {conversations.length === 0 && (
            <div className="chat-placeholder">
              <p>No conversations yet</p>
              <small>Start matching to begin chatting!</small>
            </div>
          )}
          
          {conversations.map((user) => (
            <div
              key={user._id}
              className={`conversation-item ${selectedUser?._id === user._id ? 'active' : ''}`}
              onClick={() => {
                // Find the complete user object from conversations to ensure all data is available
                const completeUser = conversations.find(u => u._id === user._id);
                setSelectedUser(completeUser || user);
              }}
            >
              <div className="conversation-avatar">
                {user.photo ? (
                  <img 
                    src={user.photo}
                    alt={user.name}
                    onError={(e) => {
                      console.error('Failed to load photo:', user.photo);
                      console.error('User data:', user);
                      // Hide the broken image and show default avatar
                      e.target.style.display = 'none';
                      const defaultAvatar = e.target.nextSibling;
                      if (defaultAvatar) {
                        defaultAvatar.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="default-avatar" style={{ display: user.photo ? 'none' : 'flex' }}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                {chatNotifications[user._id] > 0 && (
                  <span className="notification-badge">
                    {chatNotifications[user._id] > 99 ? '99+' : chatNotifications[user._id]}
                  </span>
                )}
              </div>
              
              <div className="conversation-info">
                <div className="conversation-name">{user.name}</div>
                <div className="conversation-preview">
                  {chatNotifications[user._id] > 0 ? 
                    `${chatNotifications[user._id]} new message${chatNotifications[user._id] > 1 ? 's' : ''}` : 
                    'Tap to start chatting'
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {!selectedUser ? (
          <div className="chat-welcome">
            <div className="welcome-content">
              <h2>Welcome to Amoryn Chat</h2>
              <p>Select a conversation to start messaging</p>
              {!isPremium && (
                <div className="premium-notice">
                  <p>💬 Upgrade to Premium to send messages and make video calls</p>
                  <button 
                    className="upgrade-button"
                    onClick={() => navigate('/subscription')}
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="chat-main-header">
              <div className="chat-user-info">
                <div className="chat-user-details">
                  <h3>{selectedUser.name}</h3>
                  <div className="status-container">
                    <span className="status-dot"></span>
                    <span className="user-status">Online</span>
                  </div>
                </div>
              </div>
              
              <div className="chat-actions">
                {isPremium && (
                  <span className="premium-badge" title="Premium User">
                    👑 Premium
                  </span>
                )}
                <button
                  className="action-button video-call"
                  onClick={handleVideoCall}
                  disabled={!isPremium}
                  title={!isPremium ? 'Upgrade to Premium for video calls' : 'Video Call'}
                >
                  <Video size={20} />
                </button>
                <button className="action-button more-options">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet</p>
                  <small>Start the conversation!</small>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.fromSelf ? 'sent' : 'received'}`}>
                    <div className="message-content">{msg.message}</div>
                    <div className="message-time">{formatTime(msg.timestamp)}</div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
              <div className="chat-input">
                <input
                  type="text"
                  name='message'
                  placeholder={isPremium ? 'Type a message...' : 'Upgrade to Premium to send messages'}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!isPremium}
                />
                <button 
                  className="send-button"
                  onClick={sendMessage} 
                  disabled={!isPremium || !newMessage.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
              
              {!isPremium && (
                <div className="premium-lock">
                  <p>🔒 Messaging locked for free users</p>
                  <button 
                    className="upgrade-button-small"
                    onClick={() => navigate('/subscription')}
                  >
                    Upgrade
                  </button>
                </div>
              )}
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
