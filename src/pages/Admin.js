import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  Crown, 
  Ban, 
  Unlock, 
  Search, 
  Filter, 
  Home,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';
import { BASE_URL } from '../utils/config';
import './Admin.css';

function Admin() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumUserId, setPremiumUserId] = useState(null);
  const [premiumDuration, setPremiumDuration] = useState('1month');
  const [newUsers, setNewUsers] = useState([]);
  const [showNewUsers, setShowNewUsers] = useState(false);
  const [referralCodes, setReferralCodes] = useState([]);
  const [showReferralCodes, setShowReferralCodes] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Check if user is admin
    checkAdminStatus();
    fetchUsers();
    fetchNewUsers();
    fetchReferralCodes();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const checkAdminStatus = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if user is admin (support@amoryn.in)
      if (res.data.email !== 'support@amoryn.in') {
        navigate('/dashboard');
        return;
      }
    } catch (err) {
      navigate('/login');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setMessage('Failed to fetch users');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchNewUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/new-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch new users:', err);
    }
  };

  const fetchReferralCodes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/referral-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferralCodes(res.data.referralCodes || []);
    } catch (err) {
      console.error('Failed to fetch referral codes:', err);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === 'premium') {
      filtered = filtered.filter(user => user.isPremium);
    } else if (filterStatus === 'free') {
      filtered = filtered.filter(user => !user.isPremium);
    } else if (filterStatus === 'blocked') {
      filtered = filtered.filter(user => user.isBlocked);
    } else if (filterStatus === 'suspended') {
      filtered = filtered.filter(user => user.isSuspended);
    }

    setFilteredUsers(filtered);
  };

  const handlePremiumToggle = async (userId, currentStatus) => {
    if (currentStatus) {
      // Remove premium - no duration needed
      try {
        setActionLoading(true);
        
        await axios.post(`${BASE_URL}/api/admin/premium`, {
          userId,
          action: 'remove'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Update local state
        setUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, isPremium: false }
            : user
        ));

        setMessage('Premium removed from user successfully');
        setMessageType('success');
      } catch (err) {
        setMessage('Failed to remove premium status');
        setMessageType('error');
      } finally {
        setActionLoading(false);
      }
    } else {
      // Add premium - show duration selection modal
      setPremiumUserId(userId);
      setPremiumDuration('1month');
      setShowPremiumModal(true);
    }
  };

  const handleAddPremium = async () => {
    try {
      setActionLoading(true);
      
      await axios.post(`${BASE_URL}/api/admin/premium`, {
        userId: premiumUserId,
        action: 'add',
        duration: premiumDuration
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === premiumUserId 
          ? { ...user, isPremium: true }
          : user
      ));

      setMessage(`Premium (${premiumDuration}) added to user successfully`);
      setMessageType('success');
      setShowPremiumModal(false);
      setPremiumUserId(null);
    } catch (err) {
      setMessage('Failed to add premium status');
      setMessageType('error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      const action = currentStatus ? 'unblock' : 'block';
      
      await axios.post(`${BASE_URL}/api/admin/block`, {
        userId,
        action
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isBlocked: !currentStatus }
          : user
      ));

      setMessage(`User ${action === 'block' ? 'blocked' : 'unblocked'} successfully`);
      setMessageType('success');
    } catch (err) {
      setMessage('Failed to update user status');
      setMessageType('error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      const action = currentStatus ? 'unsuspend' : 'suspend';
      
      await axios.post(`${BASE_URL}/api/admin/suspend`, {
        userId,
        action
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isSuspended: !currentStatus }
          : user
      ));

      setMessage(`User ${action === 'suspend' ? 'suspended' : 'unsuspended'} successfully`);
      setMessageType('success');
    } catch (err) {
      setMessage('Failed to update user status');
      setMessageType('error');
    } finally {
      setActionLoading(false);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const closePremiumModal = () => {
    setShowPremiumModal(false);
    setPremiumUserId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (user) => {
    if (user.isBlocked) return <span className="status-badge blocked">Blocked</span>;
    if (user.isSuspended) return <span className="status-badge suspended">Suspended</span>;
    if (user.isPremium) return <span className="status-badge premium">Premium</span>;
    return <span className="status-badge free">Free</span>;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title">
          <Users size={32} />
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-actions">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Premium Users</h3>
          <p>{users.filter(u => u.isPremium).length}</p>
        </div>
        <div className="stat-card">
          <h3>Blocked Users</h3>
          <p>{users.filter(u => u.isBlocked).length}</p>
        </div>
        <div className="stat-card">
          <h3>Suspended Users</h3>
          <p>{users.filter(u => u.isSuspended).length}</p>
        </div>
        <div className="stat-card">
          <h3>New Users (30d)</h3>
          <p>{newUsers.length}</p>
        </div>
      </div>

      {/* New Users with Referral Codes Section */}
      <div className="new-users-section">
        <div className="section-header">
          <h2>🎁 New Users with Referral Codes</h2>
          <button 
            className="toggle-button"
            onClick={() => setShowNewUsers(!showNewUsers)}
          >
            {showNewUsers ? 'Hide' : 'Show'} New Users
          </button>
        </div>
        
        {showNewUsers && (
          <div className="new-users-container">
            {newUsers.length === 0 ? (
              <p className="no-users">No new users in the last 30 days</p>
            ) : (
              <div className="new-users-grid">
                {newUsers.map(user => (
                  <div key={user._id} className="new-user-card">
                    <div className="user-header">
                      <div className="user-avatar">
                        {user.profilePicture ? (
                          <img src={`${BASE_URL}/api/user/profile/picture/${user._id}`} alt={user.name} />
                        ) : (
                          <div className="default-avatar">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="user-info">
                        <h4>{user.name || 'N/A'}</h4>
                        <p>{user.email}</p>
                        <small>Joined: {formatDate(user.createdAt)}</small>
                      </div>
                    </div>
                    
                    <div className="referral-info">
                      {user.referralCode ? (
                        <div className="referral-badge">
                          <span className="referral-label">Referral Code:</span>
                          <span className="referral-code">{user.referralCode}</span>
                        </div>
                      ) : (
                        <div className="no-referral">No Referral Code</div>
                      )}
                      
                      {user.isReferralPremium && (
                        <div className="premium-info">
                          <span className="premium-badge">24hr Premium</span>
                          {user.referralPremiumExpiry && (
                            <small>Expires: {formatDate(user.referralPremiumExpiry)}</small>
                          )}
                        </div>
                      )}
                      
                      {user.isPremium && user.subscriptionPlan && (
                        <div className="subscription-info">
                          <span className="subscription-badge">
                            {user.subscriptionPlan === 'monthly' ? '📅 Monthly' : '📅 Yearly'} Premium
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="user-status">
                      {getStatusBadge(user)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Referral Codes Management Section */}
      <div className="referral-codes-section">
        <div className="section-header">
          <h2>🎯 Referral Codes Management</h2>
          <button 
            className="toggle-button"
            onClick={() => setShowReferralCodes(!showReferralCodes)}
          >
            {showReferralCodes ? 'Hide' : 'Show'} Referral Codes
          </button>
        </div>
        
        {showReferralCodes && (
          <div className="referral-codes-container">
            {referralCodes.length === 0 ? (
              <p className="no-codes">No referral codes have been used yet</p>
            ) : (
              <div className="referral-codes-grid">
                {referralCodes.map((codeData, index) => (
                  <div key={index} className="referral-code-card">
                    <div className="code-header">
                      <h3 className="code-title">{codeData.code}</h3>
                      <div className="code-stats">
                        <span className="stat-badge usage">
                          {codeData.usageCount} {codeData.usageCount === 1 ? 'User' : 'Users'}
                        </span>
                        <span className="stat-badge active">
                          {codeData.activeUsers} Active
                        </span>
                      </div>
                    </div>
                    
                    <div className="code-details">
                      <p><strong>Total Usage:</strong> {codeData.usageCount}</p>
                      <p><strong>Active Premium:</strong> {codeData.activeUsers}</p>
                      <p><strong>Success Rate:</strong> {codeData.usageCount > 0 ? Math.round((codeData.activeUsers / codeData.usageCount) * 100) : 0}%</p>
                    </div>
                    
                    <div className="code-users">
                      <h4>Recent Users:</h4>
                      <div className="users-list">
                        {codeData.users.slice(0, 3).map((user, userIndex) => (
                          <div key={userIndex} className="user-item">
                            <span className="user-name">{user.name || 'N/A'}</span>
                            <span className="user-email">{user.email}</span>
                            <span className="user-date">{formatDate(user.createdAt)}</span>
                            {user.isReferralPremium && user.referralPremiumExpiry && new Date(user.referralPremiumExpiry) > new Date() && (
                              <span className="premium-active">⭐ Active</span>
                            )}
                          </div>
                        ))}
                        {codeData.users.length > 3 && (
                          <p className="more-users">+{codeData.users.length - 3} more users</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="admin-controls">
        <div className="search-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search users by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <Filter size={20} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Users</option>
            <option value="premium">Premium Only</option>
            <option value="free">Free Only</option>
            <option value="blocked">Blocked Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Location</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className={user.isBlocked || user.isSuspended ? 'inactive-user' : ''}>
                <td className="user-info">
                  <div className="user-avatar">
                    {user.profilePicture ? (
                      <img src={`${BASE_URL}/api/user/profile/picture/${user._id}`} alt={user.name} />
                    ) : (
                      <div className="default-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <strong>{user.name || 'N/A'}</strong>
                    <small>{user.gender || 'N/A'}</small>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.city && user.state ? `${user.city}, ${user.state}` : 'N/A'}</td>
                <td>{getStatusBadge(user)}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td className="actions">
                  <button 
                    className="action-btn view"
                    onClick={() => viewUserDetails(user)}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  
                  <button 
                    className={`action-btn ${user.isPremium ? 'premium-active' : 'premium'}`}
                    onClick={() => handlePremiumToggle(user._id, user.isPremium)}
                    disabled={actionLoading}
                    title={user.isPremium ? 'Remove Premium' : 'Add Premium'}
                  >
                    <Crown size={16} />
                  </button>
                  
                  <button 
                    className={`action-btn ${user.isBlocked ? 'unblock' : 'block'}`}
                    onClick={() => handleBlockUser(user._id, user.isBlocked)}
                    disabled={actionLoading}
                    title={user.isBlocked ? 'Unblock User' : 'Block User'}
                  >
                    {user.isBlocked ? <Unlock size={16} /> : <Ban size={16} />}
                  </button>
                  
                  <button 
                    className={`action-btn ${user.isSuspended ? 'unsuspend' : 'suspend'}`}
                    onClick={() => handleSuspendUser(user._id, user.isSuspended)}
                    disabled={actionLoading}
                    title={user.isSuspended ? 'Unsuspend User' : 'Suspend User'}
                  >
                    {user.isSuspended ? <Unlock size={16} /> : <Ban size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="close-btn" onClick={closeUserModal}>×</button>
            </div>
            
            <div className="user-profile">
              <div className="profile-image">
                {selectedUser.profilePicture ? (
                  <img src={`${BASE_URL}/api/user/profile/picture/${selectedUser._id}`} alt={selectedUser.name} />
                ) : (
                  <div className="default-avatar large">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              
              <div className="profile-info">
                <h3>{selectedUser.name || 'N/A'}</h3>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Gender:</strong> {selectedUser.gender || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> {selectedUser.dob ? formatDate(selectedUser.dob) : 'N/A'}</p>
                <p><strong>Location:</strong> {selectedUser.city && selectedUser.state ? `${selectedUser.city}, ${selectedUser.state}, ${selectedUser.country}` : 'N/A'}</p>
                <p><strong>Bio:</strong> {selectedUser.bio || 'No bio provided'}</p>
                <p><strong>Hobbies:</strong> {selectedUser.hobbies?.length ? selectedUser.hobbies.join(', ') : 'No hobbies listed'}</p>
                <p><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedUser)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Duration Modal */}
      {showPremiumModal && premiumUserId && (
        <div className="modal-overlay" onClick={closePremiumModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Premium Access</h2>
              <button className="close-btn" onClick={closePremiumModal}>×</button>
            </div>
            
            <div className="modal-body">
              <p>Select the duration for premium access:</p>
              
              <div className="duration-options">
                <label className="duration-option">
                  <input
                    type="radio"
                    name="duration"
                    value="1month"
                    checked={premiumDuration === '1month'}
                    onChange={(e) => setPremiumDuration(e.target.value)}
                  />
                  <span className="duration-label">
                    <strong>1 Month</strong>
                    <small>30 days of premium access</small>
                  </span>
                </label>
                
                <label className="duration-option">
                  <input
                    type="radio"
                    name="duration"
                    value="1year"
                    checked={premiumDuration === '1year'}
                    onChange={(e) => setPremiumDuration(e.target.value)}
                  />
                  <span className="duration-label">
                    <strong>1 Year</strong>
                    <small>365 days of premium access</small>
                  </span>
                </label>
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={closePremiumModal}>
                  Cancel
                </button>
                <button 
                  className="confirm-btn" 
                  onClick={handleAddPremium} 
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Adding Premium...' : 'Add Premium'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
