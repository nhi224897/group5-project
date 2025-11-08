import React, { useState } from 'react';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Ở đây sẽ thêm logic gọi API đăng nhập
      console.log('Đang đăng nhập với:', formData);
      
      // Giả lập call API
      if (formData.username && formData.password) {
        // Thành công
        console.log('Đăng nhập thành công');
      } else {
        setError('Vui lòng điền đầy đủ thông tin');
      }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng Nhập</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="login-button">Đăng Nhập</button>
          </div>
          <div className="form-links">
            <a href="#forgot-password">Quên mật khẩu?</a>
            <a href="#register">Đăng ký tài khoản mới</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;