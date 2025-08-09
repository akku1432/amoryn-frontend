import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Home, X } from 'lucide-react';
import { BASE_URL } from '../utils/config';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]); // New uploads
  const [imagePreviews, setImagePreviews] = useState([]); // URLs for preview
  const [existingPhotos, setExistingPhotos] = useState([]); // Saved on server
  const [hobbies, setHobbies] = useState([]);
  const [habits, setHabits] = useState({ smoking: 'None', drinking: 'None' });
  const [relationshipType, setRelationshipType] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState({ country: '', state: '', city: '' });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const availableHobbies = ['Reading', 'Traveling', 'Gaming', 'Music', 'Cooking', 'Sports'];
  const habitOptions = ['None', 'Occasionally', 'Regular'];
  const relationshipOptions = [
    'Serious Relationship',
    'Dating',
    'Situationships',
    'Friendships',
    'Just Companionship'
  ];

  const [currentPhoto, setCurrentPhoto] = useState(0); // slideshow index

  // Fetch profile data
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        const savedPhotos = data.photos || [];

        setUser(data);
        setHobbies(data.hobbies || []);
        setHabits({
          smoking: data.smoking || 'None',
          drinking: data.drinking || 'None',
        });
        setRelationshipType(data.relationshipType || '');
        setBio(data.bio || '');
        setLocation({
          country: data.country || '',
          state: data.state || '',
          city: data.city || '',
        });

        // Ensure all existing photos have full URLs and add a cache-buster
        const previewUrls = savedPhotos.map((p) => {
          const base = p.startsWith('http') ? p : `${BASE_URL}/${p.replace(/\\/g, '/')}`;
          // append cache-buster to avoid stale cached image
          return `${base}${base.includes('?') ? '&' : '?'}t=${Date.now()}`;
        });

        setExistingPhotos(savedPhotos);
        setImagePreviews(previewUrls);
      })
      .catch(() => setMessage('❌ Failed to fetch user'));
  }, [token]);

  // Auto slideshow
  useEffect(() => {
    if (imagePreviews.length > 1) {
      const timer = setInterval(() => {
        setCurrentPhoto((prev) => (prev + 1) % imagePreviews.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [imagePreviews]);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalPhotos = imagePreviews.length + newFiles.length;
    if (totalPhotos > 5) {
      setMessage('❌ You can only upload up to 5 photos.');
      return;
    }
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);

    if (index < existingPhotos.length) {
      const updatedExisting = [...existingPhotos];
      updatedExisting.splice(index, 1);
      setExistingPhotos(updatedExisting);
    } else {
      const localIndex = index - existingPhotos.length;
      const updatedNew = [...images];
      updatedNew.splice(localIndex, 1);
      setImages(updatedNew);
    }

    setCurrentPhoto((prev) => (prev >= updatedPreviews.length ? 0 : prev));
  };

  const handleHobbyToggle = (hobby) => {
    setHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imagePreviews.length < 1) {
      setMessage('❌ Upload at least 1 photo.');
      return;
    }
    const formData = new FormData();
    images.forEach((file) => formData.append('photos', file));
    formData.append('existingPhotos', JSON.stringify(existingPhotos));
    formData.append('hobbies', JSON.stringify(hobbies));
    formData.append('smoking', habits.smoking);
    formData.append('drinking', habits.drinking);
    formData.append('relationshipType', relationshipType);
    formData.append('bio', bio);
    formData.append('country', location.country);
    formData.append('state', location.state);
    formData.append('city', location.city);

    try {
      await axios.put(`${BASE_URL}/api/user/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('✅ Profile updated successfully.');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to update profile.');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="top-bar">
        <Home
          size={24}
          style={{ cursor: 'pointer', color: '#444' }}
          title="Go to Dashboard"
          onClick={() => navigate('/dashboard')}
        />
      </div>

      <h2 className="profile-page-title">Your Profile</h2>

      <div className="profile-header-row">
        <div className="profile-photo-slideshow">
          {imagePreviews.length > 0 ? (
            <img
              src={imagePreviews[currentPhoto]}
              alt={`Profile ${currentPhoto}`}
              className="profile-slideshow-img"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="profile-slideshow-placeholder">No Photo</div>
          )}
        </div>
        <div className="profile-basic-info">
          {message && <p className="message">{message}</p>}
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Gender:</strong> {user.gender}</p>
          <p><strong>Date of Birth:</strong> {user.dob?.split('T')[0]}</p>
          <p><strong>Age:</strong> {calculateAge(user.dob)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label>Upload Photos (max 5):</label>
        <div className="photo-upload">
          {imagePreviews.map((src, index) => (
            <div key={index} className="photo-card">
              <img src={src} alt={`preview-${index}`} crossOrigin="anonymous" />
              <button type="button" className="delete-btn" onClick={() => removeImage(index)}>
                <X size={16} />
              </button>
            </div>
          ))}
          {imagePreviews.length < 5 && (
            <label className="photo-card add-photo">
              +
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        <label>Hobbies:</label>
        <div className="tag-box">
          {availableHobbies.map((hobby) => (
            <div
              key={hobby}
              className={`tag ${hobbies.includes(hobby) ? 'selected' : ''}`}
              onClick={() => handleHobbyToggle(hobby)}
            >
              {hobby}
            </div>
          ))}
        </div>

        <label>Drinking:</label>
        <div className="tag-box">
          {habitOptions.map((opt) => (
            <div
              key={opt}
              className={`tag ${habits.drinking === opt ? 'selected' : ''}`}
              onClick={() => setHabits({ ...habits, drinking: opt })}
            >
              {opt}
            </div>
          ))}
        </div>

        <label>Smoking:</label>
        <div className="tag-box">
          {habitOptions.map((opt) => (
            <div
              key={opt}
              className={`tag ${habits.smoking === opt ? 'selected' : ''}`}
              onClick={() => setHabits({ ...habits, smoking: opt })}
            >
              {opt}
            </div>
          ))}
        </div>

        <label>Relationship Type:</label>
        <div className="tag-box">
          {relationshipOptions.map((opt) => (
            <div
              key={opt}
              className={`tag ${relationshipType === opt ? 'selected' : ''}`}
              onClick={() => setRelationshipType(opt)}
            >
              {opt}
            </div>
          ))}
        </div>

        <label>Country:</label>
        <input
          type="text"
          value={location.country}
          onChange={(e) => setLocation({ ...location, country: e.target.value })}
        />

        <label>State:</label>
        <input
          type="text"
          value={location.state}
          onChange={(e) => setLocation({ ...location, state: e.target.value })}
        />

        <label>City:</label>
        <input
          type="text"
          value={location.city}
          onChange={(e) => setLocation({ ...location, city: e.target.value })}
        />

        <label>Bio:</label>
        <textarea
          className="bio-input"
          placeholder="Tell us something about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div className="button-wrapper">
          <button type="submit">Save Profile</button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
