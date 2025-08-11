import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Video, Home, X } from 'lucide-react';
import { SocketContext } from '../SocketContext';
import './Friends.css';
import { BASE_URL } from '../utils/config';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  useEffect(() => {
    fetchPremiumStatus();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(res.data);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const fetchPremiumStatus = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsPremium(res.data.isPremium);
      fetchFriends();
      fetchRequests(); // ✅ Always fetch requests regardless of premium
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const acceptRequest = async (userId) => {
    try {
      await axios.post(`${BASE_URL}/api/user/match/action`, {
        targetUserId: userId,
        action: 'like',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFriends();
      fetchRequests();
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const rejectRequest = async (userId) => {
    try {
      await axios.post(`${BASE_URL}/api/user/match/action`, {
        targetUserId: userId,
        action: 'dislike',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
    } catch (err) {
      console.error('Reject error:', err);
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

  const handlePremiumFeature = (feature) => {
    setDialogMessage(`${feature} is a premium feature. Upgrade to access this feature.`);
    setShowDialog(true);
  };

  const goToChat = (user) => {
    if (!isPremium) return handlePremiumFeature("Messaging");
    navigate('/chats', {
      state: {
        userId: user._id,
        userName: user.name,
      },
    });
  };

  const startVideoCall = (user) => {
    if (!isPremium) return handlePremiumFeature("Video call");
    const queryParams = new URLSearchParams({
      userId: user._id,
      userName: user.name,
    }).toString();
    navigate(`/video-call?${queryParams}`);
  };

  return (
    <div className="friends-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Home
          size={24}
          style={{ cursor: 'pointer', color: '#444' }}
          title="Go to Dashboard"
          onClick={() => navigate('/dashboard')}
        />
      </div>

      <h2>Your Friends</h2>
      <div className="friend-list">
        {friends.length === 0 ? (
          <p className="no-friends-msg">No friends yet.</p>
        ) : (
          friends.map(friend => (
            <div className="friend-card" key={friend._id}>
              <img
                src={friend.photos && friend.photos.length > 0 ? `${BASE_URL}${friend.photos[0]}` : '/default-user.png'}
                alt={friend.name}
                onClick={() => setSelectedUser(friend)}
                onError={(e) => {
                  // Prevent infinite loop by checking if we're already using default image
                  if (e.target.src !== window.location.origin + '/default-user.png') {
                    e.target.src = '/default-user.png';
                  }
                }}
              />
              <div className="friend-details">
                <h4>{friend.name}</h4>
                <p>{calculateAge(friend.dob)} yrs</p>
                <p>{friend.gender}</p>
              </div>
              <div className="friend-actions">
                <button onClick={() => goToChat(friend)}>Message</button>
                <button onClick={() => startVideoCall(friend)}>
                  <Video size={16} style={{ marginRight: '6px' }} /> Call
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <h2>Incoming Requests</h2>
      <div className="friend-list">
        {requests.length === 0 ? (
          <p className="no-friends-msg">No requests.</p>
        ) : (
          requests.map(user => (
            <div className="friend-card" key={user._id}>
              <img
                src={user.photos && user.photos.length > 0 ? `${BASE_URL}${user.photos[0]}` : '/default-user.png'}
                alt={user.name}
                onError={(e) => {
                  // Prevent infinite loop by checking if we're already using default image
                  if (e.target.src !== window.location.origin + '/default-user.png') {
                    e.target.src = '/default-user.png';
                  }
                }}
              />
              <div className="friend-details">
                <h4>{user.name}</h4>
                <p>{calculateAge(user.dob)} yrs</p>
                <p>{user.gender}</p>
              </div>
              <div className="friend-actions">
                <button onClick={() => acceptRequest(user._id)}>Accept</button>
                <button onClick={() => rejectRequest(user._id)}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for selected friend profile */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setSelectedUser(null)}>×</span>
            <h3>{selectedUser.name} - {calculateAge(selectedUser.dob)} yrs</h3>
            <img
              src={selectedUser.photos && selectedUser.photos.length > 0 ? `${BASE_URL}${selectedUser.photos[0]}` : '/default-user.png'}
              alt="Profile"
              className="modal-photo"
              onError={(e) => {
                // Prevent infinite loop by checking if we're already using default image
                if (e.target.src !== window.location.origin + '/default-user.png') {
                  e.target.src = '/default-user.png';
                }
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
              <button className="message-button" onClick={() => goToChat(selectedUser)}>💬 Message</button>
              <button className="video-button" onClick={() => startVideoCall(selectedUser)}>
                <Video size={20} style={{ marginRight: '6px' }} /> Video Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for premium-required actions */}
      {showDialog && (
        <div className="premium-dialog" onClick={() => setShowDialog(false)}>
          <div className="premium-dialog-content" onClick={(e) => e.stopPropagation()}>
            <span className="premium-dialog-close" onClick={() => setShowDialog(false)}>
              <X size={24} />
            </span>
            <h3>Premium Required</h3>
            <p>{dialogMessage}</p>
            <button onClick={() => navigate('/subscription')}>Upgrade to Premium</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;
