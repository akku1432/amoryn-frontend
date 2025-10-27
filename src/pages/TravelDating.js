import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Home } from 'lucide-react';
import { BASE_URL } from '../utils/config';
import './TravelDating.css';

const TravelDating = () => {
  const navigate = useNavigate();
  const [travelPlans, setTravelPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [searchDestination, setSearchDestination] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterBudget, setFilterBudget] = useState('');
  const [filterInterests, setFilterInterests] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Post Form
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 'Flexible',
    interests: [],
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchCurrentUser();
    }
    fetchTravelPlans();
    fetchInterests();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCurrentUser(response.data);
      setIsPremium(response.data.isPremium || false);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchTravelPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/travel/plans`);
      if (response.data.success) {
        setTravelPlans(response.data.plans);
        setFilteredPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Error fetching travel plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterests = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/travel/interests`);
      if (response.data.success) {
        setAvailableInterests(response.data.interests);
      }
    } catch (error) {
      console.error('Error fetching interests:', error);
      // Fallback interests if API fails
      setAvailableInterests([
        'Beaches',
        'Mountains',
        'Hiking',
        'Adventure',
        'Food & Cuisine',
        'Photography',
        'Culture & History',
        'Wildlife',
        'City Tours',
        'Shopping',
        'Nightlife',
        'Relaxation',
        'Water Sports',
        'Camping',
        'Road Trips',
      ]);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...travelPlans];

    if (searchDestination) {
      filtered = filtered.filter(plan =>
        plan.destination.toLowerCase().includes(searchDestination.toLowerCase())
      );
    }

    if (filterGender) {
      filtered = filtered.filter(plan => plan.userId?.gender === filterGender);
    }

    if (filterBudget) {
      filtered = filtered.filter(plan => plan.budget === filterBudget);
    }

    if (filterInterests.length > 0) {
      filtered = filtered.filter(plan =>
        plan.interests.some(interest => filterInterests.includes(interest))
      );
    }

    if (filterStartDate) {
      filtered = filtered.filter(plan =>
        new Date(plan.startDate) >= new Date(filterStartDate)
      );
    }

    if (filterEndDate) {
      filtered = filtered.filter(plan =>
        new Date(plan.endDate) <= new Date(filterEndDate)
      );
    }

    setFilteredPlans(filtered);
  }, [searchDestination, filterGender, filterBudget, filterInterests, filterStartDate, filterEndDate, travelPlans]);

  const handleInterestToggle = (interest) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== interest),
      });
    } else {
      if (formData.interests.length < 5) {
        setFormData({
          ...formData,
          interests: [...formData.interests, interest],
        });
      }
    }
  };

  const handleFilterInterestToggle = (interest) => {
    if (filterInterests.includes(interest)) {
      setFilterInterests(filterInterests.filter(i => i !== interest));
    } else {
      setFilterInterests([...filterInterests, interest]);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.destination.trim()) {
      errors.destination = 'Destination is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errors.endDate = 'End date must be after start date';
      }
    }

    if (new Date(formData.startDate) < new Date()) {
      errors.startDate = 'Start date cannot be in the past';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePostTravelPlan = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/travel/plans`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Your travel plan has been posted! Others can now find you.');
        setShowSuccessModal(true);
        setShowPostModal(false);
        setFormData({
          destination: '',
          startDate: '',
          endDate: '',
          budget: 'Flexible',
          interests: [],
          description: '',
        });
        setFormErrors({});
        fetchTravelPlans();
      }
    } catch (error) {
      console.error('Error posting travel plan:', error);
      alert(error.response?.data?.error || 'Failed to post travel plan');
    }
  };

  const handleConnect = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/travel/connect/${plan.userId._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setShowSuccessModal(true);
      }
    } catch (error) {
      if (error.response?.data?.isPremiumRequired) {
        setShowUpgradeModal(true);
      } else {
        alert(error.response?.data?.error || 'Failed to connect');
      }
    }
  };

  const handleEditPlan = (plan) => {
    // Pre-fill form with existing plan data
    setFormData({
      destination: plan.destination,
      startDate: plan.startDate.split('T')[0],
      endDate: plan.endDate.split('T')[0],
      budget: plan.budget,
      interests: plan.interests,
      description: plan.description || '',
    });
    setShowPostModal(true);
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const clearFilters = () => {
    setSearchDestination('');
    setFilterGender('');
    setFilterBudget('');
    setFilterInterests([]);
    setFilterStartDate('');
    setFilterEndDate('');
  };

  return (
    <div className="travel-dating-container">
      {/* Hero Section */}
      <div className="travel-hero">
        <div className="hero-home-button" onClick={() => navigate('/dashboard')}>
          <Home size={28} />
        </div>
        <h1>
          Find Your Perfect Travel Partner
        </h1>
        <p>Discover people traveling to the same destinations and plan your next adventure together.</p>
        <button
          className="post-plan-button"
          onClick={() => {
            if (isAuthenticated) {
              setShowPostModal(true);
            } else {
              navigate('/login');
            }
          }}
        >
          Post My Travel Plan
        </button>
      </div>

      {/* Filter Section */}
      <div className="travel-filters">
        <h3>Find travelers by destination, date, or interest</h3>
        <div className="filter-grid">
          <div className="filter-item">
            <input
              type="text"
              placeholder="Search destination..."
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="filter-item">
            <select value={filterBudget} onChange={(e) => setFilterBudget(e.target.value)}>
              <option value="">All Budgets</option>
              <option value="Budget-friendly">Budget-friendly</option>
              <option value="Moderate">Moderate</option>
              <option value="Luxury">Luxury</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div className="filter-item">
            <input
              type="date"
              placeholder="Start date from"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <input
              type="date"
              placeholder="End date until"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Interest Filters */}
        <div className="interest-filters">
          <label>Filter by interests:</label>
          <div className="interest-tags">
            {availableInterests.slice(0, 10).map((interest) => (
              <span
                key={interest}
                className={`interest-tag ${filterInterests.includes(interest) ? 'selected' : ''}`}
                onClick={() => handleFilterInterestToggle(interest)}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Travel Feed */}
      <div className="travel-feed">
        <h2>
          {filteredPlans.length} {filteredPlans.length === 1 ? 'Traveler' : 'Travelers'} Found
        </h2>

        {loading ? (
          <div className="loading-message">Loading travel plans...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="no-plans-message">
            <p>No travel plans found matching your filters.</p>
            <p>Try adjusting your search criteria or be the first to post!</p>
          </div>
        ) : (
          <div className="travel-cards-grid">
            {filteredPlans.map((plan) => (
              <div key={plan._id} className="travel-card">
                {/* Premium Badge */}
                {plan.userId?.isPremium && (
                  <div className="premium-badge">✨ Premium Traveler</div>
                )}

                {/* User Info */}
                <div className="travel-card-header">
                  <img
                    src={
                      plan.userId?.photo
                        ? `${BASE_URL}/${plan.userId.photo}`
                        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjQ0NDIi8+PHBhdGggZD0iTTE1IDgwQzE1IDcwIDIwIDYwIDMwIDU1SDcwQzgwIDYwIDg1IDcwIDg1IDgwVjkwSDE1VjgwWiIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K'
                    }
                    alt={plan.userId?.name}
                    className="traveler-photo"
                  />
                  <div className="traveler-info">
                    <h4>{plan.userId?.name || 'Anonymous'}</h4>
                    <p className="traveler-details">
                      {plan.userId?.gender && `${plan.userId.gender}, `}
                      {plan.userId?.dob && `${calculateAge(plan.userId.dob)} yrs`}
                      {plan.userId?.city && ` • ${plan.userId.city}`}
                    </p>
                  </div>
                </div>

                {/* Destination */}
                <div className="travel-destination">
                  <span className="destination-icon">📍</span>
                  <h3>{plan.destination}</h3>
                </div>

                {/* Dates */}
                <div className="travel-dates">
                  <span className="date-icon">📅</span>
                  <span>
                    {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                  </span>
                </div>

                {/* Budget */}
                <div className="travel-budget">
                  <span className="budget-icon">💰</span>
                  <span>{plan.budget}</span>
                </div>

                {/* Interests */}
                {plan.interests && plan.interests.length > 0 && (
                  <div className="travel-interests">
                    {plan.interests.map((interest, index) => (
                      <span key={index} className="interest-badge">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {plan.description && (
                  <p className="travel-description">{plan.description}</p>
                )}

                {/* Connect/Edit Button */}
                {currentUser && plan.userId?._id === currentUser._id ? (
                  <button
                    className="edit-button"
                    onClick={() => handleEditPlan(plan)}
                  >
                    ✏️ Edit Plan
                  </button>
                ) : (
                  <button
                    className={`connect-button ${!isPremium && isAuthenticated ? 'premium-required' : ''}`}
                    onClick={() => handleConnect(plan)}
                  >
                    {!isAuthenticated
                      ? 'Login to Connect'
                      : !isPremium
                      ? '🔒 Premium Required'
                      : 'Connect'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Travel Plan Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-content post-modal" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowPostModal(false)}>
              &times;
            </span>
            <h2>Post Your Travel Plan</h2>
            <p className="modal-subtitle">Let others know where you're headed!</p>

            <form onSubmit={handlePostTravelPlan}>
              <div className="form-group">
                <label>Destination *</label>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className={formErrors.destination ? 'error' : ''}
                />
                {formErrors.destination && <span className="error-text">{formErrors.destination}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={formErrors.startDate ? 'error' : ''}
                  />
                  {formErrors.startDate && <span className="error-text">{formErrors.startDate}</span>}
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={formErrors.endDate ? 'error' : ''}
                  />
                  {formErrors.endDate && <span className="error-text">{formErrors.endDate}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Budget Range</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                >
                  <option value="Budget-friendly">Budget-friendly</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              <div className="form-group">
                <label>Interests (Select up to 5)</label>
                <div className="interest-selection">
                  {availableInterests.map((interest) => (
                    <span
                      key={interest}
                      className={`interest-tag ${formData.interests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
                <small>{formData.interests.length}/5 selected</small>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="Share a bit about your travel plans..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                  rows={4}
                />
                <small>{formData.description.length}/500 characters</small>
              </div>

              <button type="submit" className="submit-button">
                Share My Trip
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowUpgradeModal(false)}>
              &times;
            </span>
            <div className="upgrade-icon">🌟</div>
            <h2>Unlock Travel Connections</h2>
            <p>Only premium members can chat or send travel requests.</p>
            <p>Upgrade your account to start planning your next journey together!</p>
            <div className="modal-buttons">
              <button className="upgrade-button" onClick={() => navigate('/premium')}>
                Upgrade to Premium
              </button>
              <button className="later-button" onClick={() => setShowUpgradeModal(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowSuccessModal(false)}>
              &times;
            </span>
            <div className="success-icon">✓</div>
            <h2>Success!</h2>
            <p>{successMessage}</p>
            <button className="ok-button" onClick={() => setShowSuccessModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelDating;

