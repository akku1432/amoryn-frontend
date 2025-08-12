import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import { SocketContext } from '../SocketContext';
import { Video, BadgePercent, Home } from 'lucide-react';
import { BASE_URL } from '../utils/config';

function Dashboard() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [likeCountToday, setLikeCountToday] = useState(0);
  const [showLikeLimitModal, setShowLikeLimitModal] = useState(false);
  const [showPremiumFeatureModal, setShowPremiumFeatureModal] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Notification counts state
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);

  // First login profile update modal
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);

  // NEW: Profile completion modal state
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handlePremiumClick = () => {
    navigate('/subscription');
  };

  const closeDialog = () => {
    setShowDialog(false);
    setDialogMessage('');
  };

  // Fetch match users and premium status
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/user/match`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUsers(res.data.users || []);
        setIsPremium(res.data.isPremium || false);
        setLikeCountToday(res.data.likeCountToday || 0);
      })
      .catch((err) => console.error('Failed to fetch users', err));
  }, [token]);

  // Fetch user profile for friend checking
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUserProfile(res.data);
      })
      .catch((err) => console.error('Failed to fetch user profile', err));
  }, [token]);

  // Fetch friend requests count
  const fetchFriendRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendRequestsCount(res.data.length || 0);
    } catch (err) {
      setFriendRequestsCount(0);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, [token]);

  // Fetch unread chat messages counts
  useEffect(() => {
    if (!token) return;

    const fetchUnreadChats = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/chat/unread`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const totalUnread = Object.values(res.data).reduce((acc, val) => acc + val, 0);
        setChatUnreadCount(totalUnread);
      } catch (err) {
        console.error('Failed to fetch unread chat counts:', err);
      }
    };

    fetchUnreadChats();
  }, [token]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = () => setChatUnreadCount((prev) => prev + 1);
    const onNewLike = () => setFriendRequestsCount((prev) => prev + 1);

    socket.on('new-message', onNewMessage);
    socket.on('new-like', onNewLike);

    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('new-like', onNewLike);
    };
  }, [socket]);

  // First login profile update check
  useEffect(() => {
    const checkProfileUpdate = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.data.profileUpdated) {
          setShowProfileUpdateModal(true);
        }
      } catch (err) {
        console.error('Failed to check profile update status:', err);
      }
    };
    if (token) checkProfileUpdate();
  }, [token]);

  // 🔹 NEW: Profile completion check
  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Example check — adjust field list based on your backend profile model
        const { name, dob, gender, bio, photos } = res.data;
        if (!name || !dob || !gender || !bio || !photos || photos.length === 0) {
          setShowIncompleteProfileModal(true);
        }
      } catch (err) {
        console.error('Failed to check profile completion:', err);
      }
    };

    if (token) checkProfileCompletion();
  }, [token]);
  // 🔹 END NEW CODE

  const handleGoToChats = () => {
    setChatUnreadCount(0);
    navigate('/chats');
  };

  const handleGoToFriends = () => {
    setFriendRequestsCount(0);
    navigate('/friends');
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleAction = async (userId, action) => {
    if (!isPremium && action === 'like' && likeCountToday >= 10) {
      setShowLikeLimitModal(true);
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/user/match/action`,
        { targetUserId: userId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      if (action === 'like' && !isPremium) setLikeCountToday((prev) => prev + 1);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const goToChat = () => {
    if (!isPremium) {
      setShowPremiumFeatureModal(true);
      return;
    }
    if (selectedUser) {
      navigate('/chats', {
        state: { userId: selectedUser._id, userName: selectedUser.name },
      });
    }
  };

  const startVideoCall = () => {
    if (!isPremium) {
      setShowPremiumFeatureModal(true);
      return;
    }
    
    // Check if users are friends (mutual likes) for video call
    if (!selectedUser) return;
    
    // Check if the selected user has liked the current user back
    const isFriend = selectedUser.likes && selectedUser.likes.includes(userProfile?._id);
    
    if (!isFriend) {
      setDialogMessage('Video calls are only available with friends (mutual likes).');
      setShowDialog(true);
      return;
    }
    
    const queryParams = new URLSearchParams({
      userId: selectedUser._id,
      userName: selectedUser.name,
    }).toString();

    navigate(`/video-call?${queryParams}`);
    setSelectedUser(null);
  };

  const renderBadgeCount = (count) => (count > 99 ? '99+' : count);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">Amoryn</div>

      <div className="dashboard-nav">
        <Link to="/profile">Profile</Link>
        <Link to="/match">Match</Link>

        <Link
          to="/friends"
          onClick={handleGoToFriends}
          style={{ position: 'relative' }}
        >
          Friends
          {friendRequestsCount > 0 && (
            <span className="notification-badge">{renderBadgeCount(friendRequestsCount)}</span>
          )}
        </Link>

        <Link
          to="/chats"
          onClick={handleGoToChats}
          style={{ position: 'relative' }}
        >
          Chats
          {chatUnreadCount > 0 && (
            <span className="notification-badge">{renderBadgeCount(chatUnreadCount)}</span>
          )}
        </Link>
        <Link to="/Faq">FAQ</Link>

        {/* Admin Link - Only visible for admin users */}
        {userProfile?.email === 'support@amoryn.in' && (
          <Link to="/admin" className="admin-link">
            👑 Admin
          </Link>
        )}

        <button className="premium-button" onClick={handlePremiumClick}>
          <BadgePercent size={18} style={{ marginRight: '8px' }} /> Go Premium
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <h2>Welcome to Amoryn</h2>

        <div className="user-grid">
          {users.map((user) => (
            <div className="user-card" key={user._id}>
              <img
                src={
                  user.photos && user.photos.length > 0
                    ? `${BASE_URL}/${user.photos[0].replace(/^\//, '')}`
                    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo='
                }
                alt={user.name}
                onClick={() => setSelectedUser(user)}
                onError={(e) => {
                  // Set to a simple SVG placeholder if image fails to load
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=';
                }}
              />
              <h4>{user.name}</h4>
              <p>{calculateAge(user.dob)} years</p>
              <div className="like-dislike-buttons">
                <button className="like" onClick={() => handleAction(user._id, 'like')}>❤️</button>
                <button className="dislike" onClick={() => handleAction(user._id, 'dislike')}>❌</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setSelectedUser(null)}>×</span>
            <h3>
              {selectedUser.name} - {calculateAge(selectedUser.dob)} yrs
            </h3>
            <img
              src={
                selectedUser.photos && selectedUser.photos.length > 0
                  ? `${BASE_URL}/${selectedUser.photos[0].replace(/^\//, '')}`
                  : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo='
              }
              alt="Profile"
              className="modal-photo"
              onError={(e) => {
                // Set to a simple SVG placeholder if image fails to load
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=';
              }}
            />
            <p><strong>Gender:</strong> {selectedUser.gender}</p>
            <p><strong>Bio:</strong> {selectedUser.bio}</p>
            <p><strong>Hobbies:</strong> {selectedUser.hobbies?.join(', ')}</p>
            <p><strong>Drinking:</strong> {selectedUser.drinking}</p>
            <p><strong>Smoking:</strong> {selectedUser.smoking}</p>
            <p><strong>Relationship Type:</strong> {selectedUser.relationshipType}</p>
            <p><strong>Location:</strong> {selectedUser.city}, {selectedUser.state}, {selectedUser.country}</p>

            <div className="modal-buttons">
              <button className="message-button" onClick={goToChat}>💬 Message</button>
              <button className="video-button" onClick={startVideoCall}>
                <Video size={20} style={{ marginRight: '6px' }} /> Video Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Like Limit Modal */}
      {showLikeLimitModal && (
        <div className="modal-overlay" onClick={() => setShowLikeLimitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Like Limit Reached</h3>
            <p>You have reached your daily limit of 10 likes.</p>
            <p>Upgrade to Premium to enjoy unlimited likes and more!</p>
            <button onClick={handlePremiumClick}>Upgrade Now</button>
          </div>
        </div>
      )}

      {/* Premium Feature Restriction Modal */}
      {showPremiumFeatureModal && (
        <div className="modal-overlay" onClick={() => setShowPremiumFeatureModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Premium Feature</h3>
            <p>This feature is only available for Premium users.</p>
            <button onClick={handlePremiumClick}>Upgrade to Premium</button>
          </div>
        </div>
      )}

      {/* Video Call Restriction Dialog */}
      {showDialog && (
        <div className="modal-overlay" onClick={closeDialog}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Video Call Restriction</h3>
            <p>{dialogMessage}</p>
            <button onClick={closeDialog}>OK</button>
          </div>
        </div>
      )}

      {/* First Login Profile Update Modal */}
      {/* {showProfileUpdateModal && (
        <div className="modal-overlay" onClick={() => setShowProfileUpdateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Update Your Profile</h3>
            <p>We noticed this is your first login. Please update your profile to get better matches!</p>
            <button onClick={() => navigate('/profile')}>Update Now</button>
            <button onClick={() => setShowProfileUpdateModal(false)}>Maybe Later</button>
          </div>
        </div>
      )} */}
{/* 
      🔹 NEW: Incomplete Profile Modal */}
      {showIncompleteProfileModal && (
        <div className="modal-overlay" onClick={() => setShowIncompleteProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Complete Your Profile</h3>
            <p>Your profile is incomplete. Complete it to get better matches!</p>
            <button onClick={() => navigate('/profile')}>Go to Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
