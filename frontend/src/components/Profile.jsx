import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Lấy thông tin profile từ API
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/profile');
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put('http://localhost:3000/api/profile', profile);
      setProfile(response.data);
      setSuccessMessage('Cập nhật thông tin thành công!');
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        setLoading(true);
        const response = await axios.post('http://localhost:3000/api/profile/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setProfile(prevProfile => ({
          ...prevProfile,
          avatar: response.data.avatarUrl
        }));
        
        setSuccessMessage('Cập nhật ảnh đại diện thành công!');
      } catch (err) {
        setError('Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.');
        console.error('Error uploading avatar:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !profile.name) {
    return <div className="profile-loading">Đang tải thông tin...</div>;
  }

  return (
    <div className="profile-container">
      <h2>Thông Tin Cá Nhân</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="profile-content">
        <div className="avatar-section">
          <div className="avatar-container">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="profile-avatar" />
            ) : (
              <div className="avatar-placeholder">
                {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          <div className="avatar-upload">
            <label htmlFor="avatar-input" className="upload-button">
              Thay đổi ảnh
            </label>
            <input
              type="file"
              id="avatar-input"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Họ và tên:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ:</label>
            <textarea
              id="address"
              name="address"
              value={profile.address}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-actions">
            {isEditing ? (
              <>
                <button type="submit" className="save-button" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setIsEditing(false)}
                >
                  Hủy
                </button>
              </>
            ) : (
              <button 
                type="button" 
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa thông tin
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;