import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Video, Home } from 'lucide-react';
import './Match.css';
import { BASE_URL } from '../utils/config';

function Match() {
  const [matches, setMatches] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [dailyLikes, setDailyLikes] = useState(0);
  const [dialogType, setDialogType] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  
  // Mobile single profile view state
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Swipe state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset current profile index when matches change
  useEffect(() => {
    setCurrentProfileIndex(0);
  }, [matches]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/user/match`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(res.data.users || []);
        setIsPremium(res.data.isPremium || false);
        setDailyLikes(res.data.dailyLikes || 0);
      } catch (error) {
        console.error(error);
        setMessage('Failed to load matches');
      }
    };

    fetchMatches();
  }, [token]);

  // Enhanced swipe gesture handlers with visual feedback
  const minSwipeDistance = 75;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeDirection(null);
  };

  const onTouchMove = (e) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    if (touchStart) {
      const diff = currentTouch - touchStart;
      setDragOffset(diff);
      
      // Visual feedback during drag
      if (Math.abs(diff) > 10) {
        if (diff > 0) {
          setSwipeDirection('right');
        } else {
          setSwipeDirection('left');
        }
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setDragOffset(0);
      setSwipeDirection(null);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentProfileIndex < matches.length - 1) {
      setSwipeDirection('left-complete');
      setTimeout(() => {
        setCurrentProfileIndex(prev => prev + 1);
        setDragOffset(0);
        setSwipeDirection(null);
      }, 200);
    } else if (isRightSwipe && currentProfileIndex > 0) {
      setSwipeDirection('right-complete');
      setTimeout(() => {
        setCurrentProfileIndex(prev => prev - 1);
        setDragOffset(0);
        setSwipeDirection(null);
      }, 200);
    } else {
      // Snap back if swipe not far enough
      setDragOffset(0);
      setSwipeDirection(null);
    }
  };

  const handleAction = async (targetUserId, action) => {
    if (action === 'like' && !isPremium && dailyLikes >= 10) {
      setDialogType('like');
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/user/match/action`,
        { targetUserId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // On mobile, move to next profile after action
      if (isMobile) {
        if (currentProfileIndex < matches.length - 1) {
          setCurrentProfileIndex(prev => prev + 1);
        } else {
          // If it's the last profile, reset to first or show empty state
          setCurrentProfileIndex(0);
        }
      }

      setMatches((prev) => prev.filter((u) => u._id !== targetUserId));

      if (action === 'like' && !isPremium) {
        setDailyLikes((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setMessage('Action failed');
    }
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const goToChat = () => {
    if (!isPremium) {
      setDialogType('message');
      return;
    }
    if (selectedUser) {
      navigate('/chats', {
        state: {
          userId: selectedUser._id,
          userName: selectedUser.name,
        },
      });
    }
  };

  const startVideoCall = () => {
    if (!isPremium) {
      setDialogType('video');
      return;
    }
    if (!selectedUser) return;
    
    // Check if users are friends (mutual likes) for video call
    // We need to check if the selected user has liked the current user back
    // This requires fetching the current user's profile to check mutual likes
    
    // For now, we'll show a message that video calls are only for friends
    // In a real implementation, you'd need to check the friendship status
    setDialogMessage('Video calls are only available with friends (mutual likes).');
    setDialogType('friend');
    return;
    
    const queryParams = new URLSearchParams({
      userId: selectedUser._id,
      userName: selectedUser.name,
    }).toString();
    navigate(`/video-call?${queryParams}`);
    setSelectedUser(null);
  };

  const closeDialog = () => {
    setDialogType('');
    setDialogMessage('');
  };

  return (
    <div className="match-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Home
          size={24}
          style={{ cursor: 'pointer', color: '#444' }}
          title="Go to Dashboard"
          onClick={() => navigate('/dashboard')}
        />
      </div>

      <h2>Find Your Match</h2>
      <div className="match-grid">
        {isMobile ? (
          // Mobile: Show current profile with swipe gestures
          matches.length > 0 && currentProfileIndex < matches.length ? (
            <div 
              className="swipe-container"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Previous card (left side preview) */}
              {currentProfileIndex > 0 && (
                <div 
                  className="match-card match-card-stack match-card-left"
                  key={`prev-${currentProfileIndex - 1}-${matches[currentProfileIndex - 1]._id}`}
                >
                  <img
                    key={`prev-img-${currentProfileIndex - 1}-${matches[currentProfileIndex - 1]._id}`}
                    src={
                      matches[currentProfileIndex - 1].photos && matches[currentProfileIndex - 1].photos.length > 0
                        ? `${BASE_URL}/${matches[currentProfileIndex - 1].photos[0].replace(/^\//, '')}`
                        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo='
                    }
                    alt="Previous"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
              )}

              {/* Current profile (center, active) */}
              <div 
                className={`match-card match-card-active ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
                style={{
                  transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.03}deg)`,
                  transition: dragOffset === 0 ? 'transform 0.3s ease-out' : 'none'
                }}
                key={matches[currentProfileIndex]._id}
              >
              <img
                src={
                  matches[currentProfileIndex].photos && matches[currentProfileIndex].photos.length > 0
                    ? `${BASE_URL}/${matches[currentProfileIndex].photos[0].replace(/^\//, '')}`
                    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo='
                }
                alt={matches[currentProfileIndex].name}
                onClick={() => setSelectedUser(matches[currentProfileIndex])}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=';
                }}
              />
              <h4>{matches[currentProfileIndex].name}</h4>
              <p>{calculateAge(matches[currentProfileIndex].dob)} years</p>
              <div className="like-dislike-buttons">
                <button className="like" onClick={() => handleAction(matches[currentProfileIndex]._id, 'like')}>❤️</button>
                <button className="dislike" onClick={() => handleAction(matches[currentProfileIndex]._id, 'dislike')}>❌</button>
              </div>
              
              {/* Profile counter */}
              <div className="profile-counter-badge">
                {currentProfileIndex + 1} / {matches.length}
              </div>
            </div>

            {/* Next card (right side preview) */}
            {currentProfileIndex < matches.length - 1 && (
              <div 
                className="match-card match-card-stack match-card-right"
                key={`next-${currentProfileIndex + 1}-${matches[currentProfileIndex + 1]._id}`}
              >
                <img
                  key={`next-img-${currentProfileIndex + 1}-${matches[currentProfileIndex + 1]._id}`}
                  src={
                    matches[currentProfileIndex + 1].photos && matches[currentProfileIndex + 1].photos.length > 0
                      ? `${BASE_URL}/${matches[currentProfileIndex + 1].photos[0].replace(/^\//, '')}`
                      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo='
                  }
                  alt="Next"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=';
                  }}
                />
              </div>
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
          matches.map((user) => (
            <div className="match-card" key={user._id}>
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

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setSelectedUser(null)}>×</span>
            <h3>{selectedUser.name} - {calculateAge(selectedUser.dob)} yrs</h3>
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
              <button className="message-button" onClick={goToChat}>
                💬 Message
              </button>
              <button className="video-button" onClick={startVideoCall}>
                <Video size={20} style={{ marginRight: '6px' }} /> Video Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restriction Dialog Box */}
      {dialogType && (
        <div className="restriction-dialog-backdrop" onClick={closeDialog}>
          <div className="restriction-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Premium Feature</h3>
            {dialogType === 'like' && (
              <p>You’ve reached your daily limit of 10 likes. Upgrade to Premium to continue liking profiles.</p>
            )}
            {dialogType === 'message' && (
              <p>Messaging is only available to Premium users. Please upgrade to continue.</p>
            )}
            {dialogType === 'video' && (
              <p>Video calls are only available to Premium users. Please upgrade to continue.</p>
            )}
            {dialogType === 'friend' && (
              <p>{dialogMessage}</p>
            )}
            <button className="upgrade-btn" onClick={() => navigate('/subscription')}>
              Upgrade to Premium
            </button>
            <button className="cancel-btn" onClick={closeDialog}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Match;
