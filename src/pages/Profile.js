import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import { BASE_URL } from "../utils/config";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    country: "",
    state: "",
    city: "",
    hobbies: [],
    smoking: "",
    drinking: "",
    relationshipType: "",
    bio: "",
  });

  const [age, setAge] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const hobbiesOptions = [
    "Traveling", "Cooking", "Music", "Dancing",
    "Reading", "Sports", "Gaming", "Fitness",
    "Photography", "Movies", "Art", "Outdoors"
  ];
  const smokingOptions = ["Non-smoker", "Occasionally", "Regular smoker"];
  const drinkingOptions = ["Non-drinker", "Occasionally", "Social drinker", "Regular drinker"];
  const relationshipOptions = [
    "Friendship", "Casual dating", "Long-term relationship",
    "Marriage", "Networking", "Travel buddy"
  ];

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data) return;

        const user = res.data;
        const dobFormatted = user.dob ? user.dob.split("T")[0] : "";

        setFormData({
          name: user.name || "",
          gender: user.gender || "",
          dob: dobFormatted,
          country: user.country || "",
          state: user.state || "",
          city: user.city || "",
          hobbies: Array.isArray(user.hobbies) ? user.hobbies : [],
          smoking: user.smoking || "",
          drinking: user.drinking || "",
          relationshipType: user.relationshipType || "",
          bio: user.bio || "",
        });

        if (dobFormatted) {
          const birthDate = new Date(dobFormatted);
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          setAge(calculatedAge);
        }

        if (user.profilePicture && user._id) {
          setPreviewImage(`${BASE_URL}/api/user/profile/picture/${user._id}`);
        } else {
          setPreviewImage(null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "hobbies") {
      setFormData((prev) => {
        if (checked) {
          return { ...prev, hobbies: [...prev.hobbies, value] };
        } else {
          return { ...prev, hobbies: prev.hobbies.filter((h) => h !== value) };
        }
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateProgress("Updating profile...");

    try {
      // Create FormData for both text and image
      const formDataToSend = new FormData();
      
      // Add text data
      formDataToSend.append('hobbies', JSON.stringify(Array.isArray(formData.hobbies) ? formData.hobbies : []));
      formDataToSend.append('smoking', formData.smoking || "");
      formDataToSend.append('drinking', formData.drinking || "");
      formDataToSend.append('relationshipType', formData.relationshipType || "");
      formDataToSend.append('bio', formData.bio || "");
      formDataToSend.append('country', formData.country || "");
      formDataToSend.append('city', formData.city || "");
      formDataToSend.append('state', formData.state || "");

      // Add image if selected
      if (profileImage) {
        formDataToSend.append('profilePicture', profileImage);
        setUpdateProgress("Uploading profile picture...");
      }

      // Single API call to update everything
      const response = await axios.put(`${BASE_URL}/api/user/profile`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUpdateProgress("Profile updated successfully!");
      
      // Update preview image if new image was uploaded
      if (profileImage) {
        // Force refresh the image by adding timestamp
        setPreviewImage(`${BASE_URL}/api/user/profile/picture/${userProfile?._id}?t=${Date.now()}`);
        setProfileImage(null);
      }

      // Clear progress after 2 seconds
      setTimeout(() => {
        setUpdateProgress("");
      }, 2000);

    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
      setUpdateProgress("Failed to update profile. Please try again.");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setUpdateProgress("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/user/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdateProgress("Your account has been deleted successfully.");
      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      console.error("Error deleting account:", err);
      setUpdateProgress("Failed to delete account. Please try again.");
      setTimeout(() => {
        setUpdateProgress("");
      }, 3000);
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>Profile</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => navigate('/dashboard')} className="home-button">
            <Home size={20} style={{ marginRight: '6px' }} />
            Home
          </button>
          <button onClick={handleDeleteAccount} className="delete-btn">Delete Account</button>
        </div>
      </div>

      {/* Progress indicator */}
      {updateProgress && (
        <div className={`progress-message ${updateProgress.includes('successfully') ? 'success' : updateProgress.includes('Failed') ? 'error' : 'info'}`}>
          {updateProgress}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-image-section">
          {previewImage ? (
            <img 
              src={previewImage} 
              alt="Profile" 
              className="profile-preview" 
              onClick={() => window.open(previewImage, '_blank')}
              title="Click to view full size"
            />
          ) : (
            <div className="profile-placeholder">No image selected</div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />

          <input type="text" name="name" value={formData.name} readOnly placeholder="Name" />
          <select name="gender" value={formData.gender} disabled>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input type="date" name="dob" value={formData.dob} readOnly />
          <input type="text" value={age ? `${age} years old` : ""} readOnly placeholder="Age" />
          <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
          <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
          <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
        </div>

        <div>
          <h4>Hobbies</h4>
          <div className="options-wrap">
            {hobbiesOptions.map((hobby) => (
              <label key={hobby}>
                <input
                  type="checkbox"
                  name="hobbies"
                  value={hobby}
                  checked={formData.hobbies.includes(hobby)}
                  onChange={handleChange}
                />{" "}
                {hobby}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4>Smoking</h4>
          {smokingOptions.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="smoking"
                value={option}
                checked={formData.smoking === option}
                onChange={handleChange}
              /> {option}
            </label>
          ))}
        </div>

        <div>
          <h4>Drinking</h4>
          {drinkingOptions.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="drinking"
                value={option}
                checked={formData.drinking === option}
                onChange={handleChange}
              /> {option}
            </label>
          ))}
        </div>

        <div>
          <h4>Relationship Type</h4>
          {relationshipOptions.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="relationshipType"
                value={option}
                checked={formData.relationshipType === option}
                onChange={handleChange}
              /> {option}
            </label>
          ))}
        </div>

        <div>
          <h4>Bio</h4>
          <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Write something about yourself..." />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? (
            <span className="loading-spinner">
              <div className="spinner"></div>
              Updating...
            </span>
          ) : (
            "Update Profile"
          )}
        </button>
      </form>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="dialog-overlay" onClick={closeDeleteDialog}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="dialog-actions">
              <button 
                className="cancel-btn" 
                onClick={closeDeleteDialog}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-btn" 
                onClick={confirmDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="loading-spinner">
                    <div className="spinner"></div>
                    Deleting...
                  </span>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;