import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiEdit, FiSave, FiUpload, FiX } from 'react-icons/fi';

const ProfilePage = () => {
  const { state } = useLocation();
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
  });
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (state?.userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`https://chatapplication-2o-backend-production.up.railway.app/api/auth/users/${state.userId}`);
          setUserData(response.data);
          setFormData({
            username: response.data.username,
            phone: response.data.phone || '',
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }
  }, [state?.userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setAvatar(e.target.files[0]);
    }
  };

 const handleProfileUpdate = async () => {
  const form = new FormData();
  form.append('username', formData.username);
  form.append('phone', formData.phone);

  if (avatar) {
    form.append('avatar', avatar);
  }

  try {
    const response = await axios.put(
      `https://chatapplication-2o-backend-production.up.railway.app/api/auth/updateProfile/${state.userId}`,
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.user) {
      alert('Profile updated successfully!');
      setUserData(response.data.user);
      setEditMode(false);
      setAvatar(null);

      // Store updated user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};


  const handleEditToggle = () => {
    setEditMode((prev) => !prev);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setAvatar(null);
    setFormData({
      username: userData.username,
      phone: userData.phone || '',
    });
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile_page_main">
      <div className="profile_page_container">
        <h2>User Profile</h2>

        <div className="profile_image_container">
          {/* <img
            src={`https://chatapplication-2o-backend-production.up.railway.app${userData.avatar || '/assets/default-profile.png'}?t=${new Date().getTime()}`}
            alt="Profile Avatar"
          /> */}

          <img 
  src={`https://chatapplication-2o-backend-production.up.railway.app${userData.avatar}?t=${new Date().getTime()}`} 
  alt="Profile" 
/>

          {editMode && (
            <div className="upload_section">
              <input
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="avatarUpload"
              />
              <FiUpload
                size={20}
                className="icon"
                style={{ cursor: 'pointer' }}
                onClick={() => document.getElementById('avatarUpload').click()}
              />
            </div>
          )}
        </div>

        <div className="profile_details">
          {editMode ? (
            <>
              <p>
                <strong>Username:</strong>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </p>
              <p>
                <strong>Phone:</strong>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Username:</strong> {userData.username}
              </p>
              <p>
                <strong>Phone:</strong> {userData.phone || 'Not Available'}
              </p>
            </>
          )}
          <p>
            <strong>Joined At:</strong> {new Date(userData.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        {!editMode ? (
          <button className="edit_button" onClick={handleEditToggle}>
            <FiEdit size={16} style={{ marginRight: '5px' }} />
            Edit Profile
          </button>
        ) : (
          <div className="action_buttons">
            <button className="save_button" onClick={handleProfileUpdate}>
              <FiSave size={16} style={{ marginRight: '5px' }} />
              Save Changes
            </button>
            <button className="cancel_button" onClick={handleCancelEdit}>
              <FiX size={16} style={{ marginRight: '5px' }} />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
