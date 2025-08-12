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
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

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
        {matches.map((user) => (
          <div className="match-card" key={user._id}>
            <img
              src={
                user.photos && user.photos.length > 0
                  ? `${BASE_URL}${user.photos[0]}`
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

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setSelectedUser(null)}>×</span>
            <h3>{selectedUser.name} - {calculateAge(selectedUser.dob)} yrs</h3>
            <img
              src={
                selectedUser.photos && selectedUser.photos.length > 0
                  ? `${BASE_URL}${selectedUser.photos[0]}`
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
