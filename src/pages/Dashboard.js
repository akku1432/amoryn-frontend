import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import { SocketContext } from '../SocketContext';
import { Video, BadgePercent, Home } from 'lucide-react';
import { BASE_URL } from '../utils/config';
import LoginModal from '../components/LoginModal';

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

  // Mobile single profile view state
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Navigation for mobile - Simple arrows instead of swipe
  const [currentOffset, setCurrentOffset] = useState(0);

  // NEW: Referral premium status
  const [isReferralPremium, setIsReferralPremium] = useState(false);
  const [referralPremiumExpiry, setReferralPremiumExpiry] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // NEW: Login modal for unauthenticated users
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Countdown timer for referral premium
  useEffect(() => {
    if (isReferralPremium && referralPremiumExpiry) {
      const timer = setInterval(() => {
        const now = new Date();
        const expiry = new Date(referralPremiumExpiry);
        const diff = expiry - now;
        
        if (diff <= 0) {
          setTimeRemaining('Expired');
          setIsReferralPremium(false);
          setShowExpiredModal(true);
          clearInterval(timer);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isReferralPremium, referralPremiumExpiry]);

  // Notification counts state
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [newChatNotification, setNewChatNotification] = useState(false);
  const [newFriendNotification, setNewFriendNotification] = useState(false);



  // NEW: Profile completion modal state
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const token = localStorage.getItem('token');

  // Check authentication status
  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset current profile index when users change
  useEffect(() => {
    setCurrentProfileIndex(0);
  }, [users]);

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
    if (token) {
      // Authenticated user - fetch personalized matches
      axios
        .get(`${BASE_URL}/api/user/match`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setUsers(res.data.users || []);
          setIsPremium(res.data.isPremium || false);
          setLikeCountToday(res.data.likeCountToday || 0);
        })
        .catch((err) => console.error('Failed to fetch users', err));
    } else {
      // Unauthenticated user - fetch public profiles
      axios
        .get(`${BASE_URL}/api/user/public/profiles`)
        .then((res) => {
          setUsers(res.data.users || []);
          setIsPremium(false);
          setLikeCountToday(0);
        })
        .catch((err) => console.error('Failed to fetch profiles', err));
    }
  }, [token]);

  // Fetch user profile for friend checking (only if authenticated)
  useEffect(() => {
    if (token) {
      axios
        .get(`${BASE_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setUserProfile(res.data);
          // Set referral premium status
          setIsReferralPremium(res.data.isReferralPremium || false);
          setReferralPremiumExpiry(res.data.referralPremiumExpiry || null);
        })
        .catch((err) => console.error('Failed to fetch user profile', err));
    }
  }, [token]);

  // Fetch friend requests count (only if authenticated)
  const fetchFriendRequests = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/user/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendRequestsCount(res.data.length || 0);
    } catch (err) {
      setFriendRequestsCount(0);
    }
  };

  // Fetch unread chat messages counts
  const fetchUnreadChats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/chat/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const totalUnread = Object.values(res.data).reduce((acc, val) => acc + val, 0);
      setChatUnreadCount(totalUnread);
    } catch (err) {
      console.error('Failed to fetch unread chat counts:', err);
      setChatUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, [token]);

  // Fetch unread chat messages counts
  useEffect(() => {
    if (token) {
      fetchUnreadChats();
    }
  }, [token]);

  // Periodic refresh of notification counts (every 30 seconds)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchFriendRequests();
      fetchUnreadChats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [token]);

  // Socket listeners for real-time notifications
  useEffect(() => {
    if (!socket) return;

    // Register user for WebSocket notifications
    if (userProfile?._id) {
      socket.emit('register-user', userProfile._id);
    }

    const onNewMessage = (data) => {
      // Only increment if it's not from the current user
      if (data.from !== userProfile?._id) {
        setChatUnreadCount((prev) => prev + 1);
        setNewChatNotification(true);
        // Clear animation after 1 second
        setTimeout(() => setNewChatNotification(false), 1000);
      }
    };

    const onNewLike = (data) => {
      // Only increment if someone liked the current user
      if (data.from !== userProfile?._id) {
        setFriendRequestsCount((prev) => prev + 1);
        setNewFriendNotification(true);
        // Clear animation after 1 second
        setTimeout(() => setNewFriendNotification(false), 1000);
      }
    };

    const onMessageRead = () => {
      // Refresh unread count when messages are read
      fetchUnreadChats();
    };

    const onFriendRequestAccepted = () => {
      // Refresh friend requests count when one is accepted
      fetchFriendRequests();
    };

    socket.on('new-message', onNewMessage);
    socket.on('new-like', onNewLike);
    socket.on('message-read', onMessageRead);
    socket.on('friend-request-accepted', onFriendRequestAccepted);

    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('new-like', onNewLike);
      socket.off('message-read', onMessageRead);
      socket.off('friend-request-accepted', onFriendRequestAccepted);
    };
  }, [socket, userProfile]);



  // 🔹 NEW: Profile completion check (only for authenticated users)
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!token) return; // Skip if not authenticated
      
      try {
        const res = await axios.get(`${BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Check all required fields based on backend profile completion logic
        const { 
          hobbies, 
          smoking, 
          drinking, 
          relationshipType, 
          bio, 
          country, 
          state, 
          city 
        } = res.data;
        
        const isProfileComplete = 
          hobbies && hobbies.length > 0 &&
          smoking && smoking.trim() !== '' &&
          drinking && drinking.trim() !== '' &&
          relationshipType && relationshipType.length > 0 &&
          bio && bio.trim() !== '' &&
          country && country.trim() !== '' &&
          state && state.trim() !== '' &&
          city && city.trim() !== '';
        
        if (!isProfileComplete) {
          setShowIncompleteProfileModal(true);
        } else {
          setShowIncompleteProfileModal(false);
        }
      } catch (err) {
        console.error('Failed to check profile completion:', err);
      }
    };

    checkProfileCompletion();
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

  // Simple navigation handlers for arrow buttons
  const handlePrevProfile = () => {
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(prev => prev - 1);
    }
  };

  const handleNextProfile = () => {
    if (currentProfileIndex < users.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    }
  };

  const handleAction = async (userId, action) => {
    // Check if user is authenticated
    if (!token) {
      setShowLoginModal(true);
      return;
    }

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
      
      // On mobile, move to next profile after action
      if (isMobile) {
        if (currentProfileIndex < users.length - 1) {
          setCurrentProfileIndex(prev => prev + 1);
        } else {
          // If it's the last profile, reset to first or show empty state
          setCurrentProfileIndex(0);
        }
      }
      
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      if (action === 'like' && !isPremium) setLikeCountToday((prev) => prev + 1);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Reload the page to fetch authenticated data
    window.location.reload();
  };

  const goToChat = () => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }
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
    if (!token) {
      setShowLoginModal(true);
      return;
    }
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
            <span className={`notification-badge ${newFriendNotification ? 'new-notification' : ''}`}>
              {renderBadgeCount(friendRequestsCount)}
            </span>
          )}
        </Link>

        <Link
          to="/chats"
          onClick={handleGoToChats}
          style={{ position: 'relative' }}
        >
          Chats
          {chatUnreadCount > 0 && (
            <span className={`notification-badge ${newChatNotification ? 'new-notification' : ''}`}>
              {renderBadgeCount(chatUnreadCount)}
            </span>
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
          <BadgePercent size={18} style={{ marginRight: '8px' }} /> 
          {isReferralPremium && referralPremiumExpiry && new Date(referralPremiumExpiry) > new Date() 
            ? 'Premium Active' 
            : 'Go Premium'
          }
        </button>
        
        {/* Show Logout button if authenticated, Login button if not */}
        {isAuthenticated ? (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="logout-button" onClick={() => setShowLoginModal(true)}>
            Login
          </button>
        )}
      </div>

      <div className="dashboard-content">
        <h2>Welcome to Amoryn</h2>

        {/* Referral Premium Status Display */}
        {isReferralPremium && referralPremiumExpiry && (
          <div className="referral-premium-banner">
            <div className="premium-icon">🎁</div>
            <div className="premium-info">
              <h3>24-Hour Premium Access Active!</h3>
              <p>You're enjoying premium features thanks to your referral code.</p>
              <p className="expiry-info">
                Time Remaining: <span className="countdown">{timeRemaining}</span>
              </p>
              <p className="expiry-info">
                Expires: {new Date(referralPremiumExpiry).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="user-grid">
          {isMobile ? (
            // Mobile: Show current profile with swipe gestures
            users.length > 0 && currentProfileIndex < users.length ? (
              <div className="mobile-profile-container">
                {/* Left Arrow - always show as placeholder or button */}
                {currentProfileIndex > 0 ? (
                  <button 
                    className="profile-nav-arrow"
                    onClick={handlePrevProfile}
                  >
                    ‹
                  </button>
                ) : (
                  <div style={{ width: '50px', flexShrink: 0 }}></div>
                )}

                {/* Profile Card */}
                <div className="user-card" key={users[currentProfileIndex]._id}>
                <img
                  src={
                    users[currentProfileIndex].photos && users[currentProfileIndex].photos.length > 0
                      ? `${BASE_URL}/${users[currentProfileIndex].photos[0].replace(/^\//, '')}`
                      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo='
                  }
                  alt={users[currentProfileIndex].name}
                  onClick={() => setSelectedUser(users[currentProfileIndex])}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=';
                  }}
                />
                <h4>{users[currentProfileIndex].name}</h4>
                <p>{calculateAge(users[currentProfileIndex].dob)} years</p>
                <div className="like-dislike-buttons">
                  <button className="like" onClick={() => handleAction(users[currentProfileIndex]._id, 'like')}>❤️</button>
                  <button className="dislike" onClick={() => handleAction(users[currentProfileIndex]._id, 'dislike')}>❌</button>
                </div>
                
                {/* Profile counter */}
                <div className="profile-counter-badge">
                  {currentProfileIndex + 1} / {users.length}
                </div>
              </div>

                {/* Right Arrow - always show as placeholder or button */}
                {currentProfileIndex < users.length - 1 ? (
                  <button 
                    className="profile-nav-arrow"
                    onClick={handleNextProfile}
                  >
                    ›
                  </button>
                ) : (
                  <div style={{ width: '50px', flexShrink: 0 }}></div>
                )}
              </div>
            ) : (
              <div className="no-profiles-message">
                <h3>No more profiles to show</h3>
                <p>Check back later for new matches!</p>
              </div>
            )
          ) : (
            // Desktop: Show all profiles in grid
            users.map((user) => (
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
            ))
          )}
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

      {/* Incomplete Profile Modal */}
      {showIncompleteProfileModal && (
        <div className="modal-overlay" onClick={() => setShowIncompleteProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Complete Your Profile</h3>
            <p>Your profile is incomplete. Complete it to get better matches!</p>
            <button onClick={() => navigate('/profile')}>Go to Profile</button>
          </div>
        </div>
      )}

      {/* Referral Premium Expired Modal */}
      {showExpiredModal && (
        <div className="modal-overlay" onClick={() => setShowExpiredModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="expired-modal-header">
              <span className="expired-icon">⏰</span>
              <h3>Premium Access Expired</h3>
            </div>
            <p>Your 24-hour premium access from the referral code has expired.</p>
            <p>To continue enjoying premium features, please purchase a subscription plan.</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowExpiredModal(false)}>
                Maybe Later
              </button>
              <button className="primary-btn" onClick={() => {
                setShowExpiredModal(false);
                handlePremiumClick();
              }}>
                Get Premium Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal for unauthenticated users */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default Dashboard;
