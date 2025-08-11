import React, { useState, useEffect } from "react";
import axios from "axios";
import './Profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    lookingFor: "",
    country: "",
    state: "",
    city: "",
    hobbies: "",
    smoking: "",
    drinking: "",
    relationshipType: "",
    bio: "",
  });

  const [age, setAge] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch existing user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data;

        const dobFormatted = user.dob ? user.dob.split("T")[0] : "";
        setFormData({
          name: user.name || "",
          gender: user.gender || "",
          dob: dobFormatted,
          lookingFor: user.lookingFor || "",
          country: user.country || "",
          state: user.state || "",
          city: user.city || "",
          hobbies: user.hobbies ? user.hobbies.join(", ") : "",
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

        if (user.profileImage) {
          setPreviewImage(`/uploads/${user.profileImage}`);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [token]);

  // Handle text input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      for (let key in formData) {
        if (key === "hobbies") {
          data.append(key, formData[key].split(",").map((h) => h.trim()));
        } else {
          data.append(key, formData[key]);
        }
      }
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      await axios.put("/api/user/profile", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }

    try {
      await axios.delete("/api/user/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Your account has been deleted.");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account.");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Edit Profile</h2>
        <button
          onClick={handleDeleteAccount}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Delete Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Profile Image */}
        <div className="profile-image-section">
          {previewImage ? (
            <img src={previewImage} alt="Profile" className="profile-preview" />
          ) : (
            <div className="profile-placeholder">No image selected</div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Read-only details */}
        <input type="text" name="name" value={formData.name} readOnly placeholder="Name" />
        <select name="gender" value={formData.gender} disabled>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input type="date" name="dob" value={formData.dob} readOnly />
        <input type="text" value={age ? `${age} years old` : ""} readOnly placeholder="Age" />
        <input type="text" name="lookingFor" value={formData.lookingFor} readOnly placeholder="Looking For" />

        {/* Editable details */}
        <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
        <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
        <input type="text" name="hobbies" value={formData.hobbies} onChange={handleChange} placeholder="Hobbies (comma-separated)" />
        <select name="smoking" value={formData.smoking} onChange={handleChange}>
          <option value="">Smoking?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        <select name="drinking" value={formData.drinking} onChange={handleChange}>
          <option value="">Drinking?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        <input type="text" name="relationshipType" value={formData.relationshipType} onChange={handleChange} placeholder="Relationship Type" />
        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Bio" />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
