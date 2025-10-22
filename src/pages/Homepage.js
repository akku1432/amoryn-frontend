import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Homepage.css';
import { BASE_URL } from '../utils/config';
import LoginModal from '../components/LoginModal';

function Homepage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const token = localStorage.getItem('token');

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch public profiles
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/user/public/profiles`)
      .then((res) => {
        setUsers(res.data.users || []);
      })
      .catch((err) => console.error('Failed to fetch profiles', err));
  }, []);

  // Reset current profile index when users change
  useEffect(() => {
    setCurrentProfileIndex(0);
  }, [users]);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // Mobile navigation functions
  const nextProfile = () => {
    if (currentProfileIndex < users.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    }
  };

  const previousProfile = () => {
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(prev => prev - 1);
    }
  };

  const handleAction = (action) => {
    // Show login modal when user tries to like/dislike
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Redirect to dashboard after login
    navigate('/dashboard');
  };

  const handleGoToDashboard = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="homepage-container">
      <div className="homepage-header">
        <div className="homepage-logo">Amoryn</div>
        <div className="homepage-nav">
          {token ? (
            <button onClick={handleGoToDashboard} className="nav-button primary">
              Go to Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => setShowLoginModal(true)} className="nav-button primary">
                Login
              </button>
              <Link to="/signup" className="nav-button secondary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="homepage-content">
        <div className="homepage-hero">
          <h1>Welcome to Amoryn</h1>
          <p className="homepage-tagline">"Where hearts connect, stories begin."</p>
          <p className="homepage-description">
            Discover amazing people and start your journey to meaningful connections
          </p>
        </div>

        <div className="user-grid">
          {isMobile ? (
            // Mobile: Show only current profile
            users.length > 0 && currentProfileIndex < users.length ? (
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
                  <button className="like" onClick={() => handleAction('like')}>❤️</button>
                  <button className="dislike" onClick={() => handleAction('dislike')}>❌</button>
                </div>
                
                {/* Mobile navigation buttons */}
                <div className="mobile-nav-buttons">
                  <button 
                    className="nav-btn prev-btn" 
                    onClick={previousProfile}
                    disabled={currentProfileIndex === 0}
                  >
                    ← Previous
                  </button>
                  <span className="profile-counter">
                    {currentProfileIndex + 1} of {users.length}
                  </span>
                  <button 
                    className="nav-btn next-btn" 
                    onClick={nextProfile}
                    disabled={currentProfileIndex >= users.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-profiles-message">
                <h3>No profiles to show</h3>
                <p>Check back later!</p>
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
                  <button className="like" onClick={() => handleAction('like')}>❤️</button>
                  <button className="dislike" onClick={() => handleAction('dislike')}>❌</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="homepage-cta">
          <h3>Ready to start your journey?</h3>
          <p>Login or sign up to like profiles and connect with people</p>
          <div className="cta-buttons">
            <button onClick={() => setShowLoginModal(true)} className="cta-button primary">
              Get Started
            </button>
            <Link to="/signup" className="cta-button secondary">
              Create Account
            </Link>
          </div>
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
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0NDQyIvPjxwYXRoIGQ9Ik0zMCAxNjBDMzAgMTQwIDQwIDEyMCA2MCAxMTBIMTQwQzE2MCAxMjAgMTcwIDE0MCAxNzAgMTYwVjE4MEgzMFYxNjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=';
              }}
            />
            <p><strong>Gender:</strong> {selectedUser.gender}</p>
            {selectedUser.bio && <p><strong>Bio:</strong> {selectedUser.bio}</p>}
            {selectedUser.hobbies && selectedUser.hobbies.length > 0 && (
              <p><strong>Hobbies:</strong> {selectedUser.hobbies.join(', ')}</p>
            )}
            {selectedUser.city && (
              <p><strong>Location:</strong> {selectedUser.city}, {selectedUser.state}, {selectedUser.country}</p>
            )}

            <div className="modal-buttons">
              <button className="message-button" onClick={() => setShowLoginModal(true)}>
                💬 Message
              </button>
              <button className="like-button" onClick={() => handleAction('like')}>
                ❤️ Like
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/contact-us">Contact Us</Link>
          <Link to="/Faq">FAQ</Link>
        </div>
        <p className="footer-copyright">© 2025 Amoryn. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Homepage;

