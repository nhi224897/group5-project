import React, { useState, useRef } from 'react';
import axios from 'axios';
import './UploadAvatar.css';

function UploadAvatar() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for Cloudinary
        setError('Kích thước file không được vượt quá 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn một hình ảnh');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    setLoading(true);
    setError(null);

    try {
      // Upload to Cloudinary
      const cloudinaryData = new FormData();
      cloudinaryData.append('file', selectedFile);
      cloudinaryData.append('upload_preset', 'group5_avatar'); // Replace with your upload preset

      const cloudinaryResponse = await axios.post(
        'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', // Replace with your cloud name
        cloudinaryData
      );

      // Send avatar URL to our backend
      const response = await axios.post('http://localhost:5000/api/users/upload-avatar', {
        avatarUrl: cloudinaryResponse.data.secure_url
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      setSuccess(true);
      setSelectedFile(null);
      
      // Thông báo thành công với URL ảnh từ server
      if (response.data && response.data.avatarUrl) {
        console.log('Avatar URL:', response.data.avatarUrl);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Không thể tải lên ảnh. Vui lòng thử lại sau.'
      );
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="upload-avatar-container">
      <h2>Tải Lên Ảnh Đại Diện</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Tải lên ảnh thành công!</div>}

      <div 
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
          </div>
        ) : (
          <div className="upload-placeholder">
            <i className="upload-icon">📸</i>
            <p>Nhấp vào đây hoặc kéo thả hình ảnh</p>
            <span className="upload-note">
              Hỗ trợ: JPG, PNG, GIF (Tối đa: 10MB)
            </span>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="file-input"
        />
      </div>

      {selectedFile && (
        <div className="file-info">
          <p>Tên file: {selectedFile.name}</p>
          <p>Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
        </div>
      )}

      <div className="button-container">
        {preview && (
          <button 
            className="change-image-button"
            onClick={triggerFileInput}
          >
            Chọn ảnh khác
          </button>
        )}
        
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
        >
          {loading ? 'Đang tải lên...' : 'Tải lên'}
        </button>
      </div>

      <div className="avatar-guidelines">
        <h3>Hướng dẫn:</h3>
        <ul>
          <li>Kích thước file tối đa: 10MB</li>
          <li>Định dạng hỗ trợ: JPG, PNG, GIF</li>
          <li>Nên sử dụng ảnh vuông để hiển thị tốt nhất</li>
          <li>Tránh sử dụng ảnh có nội dung không phù hợp</li>
        </ul>
      </div>
    </div>
  );
}

export default UploadAvatar;