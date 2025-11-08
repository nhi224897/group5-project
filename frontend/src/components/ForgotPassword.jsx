import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Có lỗi xảy ra. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="success-message">
          <h2>Kiểm tra email của bạn</h2>
          <p>
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email {email}.
            Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
          </p>
          <p className="note">
            *Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <h2>Quên Mật Khẩu?</h2>
      <p className="description">
        Vui lòng nhập địa chỉ email bạn đã đăng ký. 
        Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu vào email của bạn.
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div className="form-group">
          <label htmlFor="email">Địa chỉ email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập địa chỉ email của bạn"
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
        </button>

        <div className="back-to-login">
          <a href="/login">← Quay lại trang đăng nhập</a>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;