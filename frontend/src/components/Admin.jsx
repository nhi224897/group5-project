import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

function Admin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/admin/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active'
    });
    setSelectedUser(null);
    setIsEditing(false);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing && selectedUser) {
        // Cập nhật người dùng hiện có
        await axios.put(`http://localhost:3000/api/admin/users/${selectedUser._id}`, formData);
        setSuccessMessage('Cập nhật người dùng thành công!');
      } else {
        // Tạo người dùng mới
        await axios.post('http://localhost:3000/api/admin/users', formData);
        setSuccessMessage('Thêm người dùng mới thành công!');
      }
      fetchUsers();
      resetForm();
    } catch (err) {
      setError(isEditing 
        ? 'Không thể cập nhật người dùng. Vui lòng thử lại sau.'
        : 'Không thể thêm người dùng mới. Vui lòng thử lại sau.');
      console.error('Error submitting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`);
      setSuccessMessage('Xóa người dùng thành công!');
      fetchUsers();
    } catch (err) {
      setError('Không thể xóa người dùng. Vui lòng thử lại sau.');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !users.length) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-container">
      <h2>Quản Lý Người Dùng</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="admin-content">
        <div className="user-form-section">
          <h3>{isEditing ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}</h3>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label htmlFor="name">Họ và tên:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Vai trò:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
                <option value="editor">Biên tập viên</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="banned">Bị cấm</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : (isEditing ? 'Cập Nhật' : 'Thêm Mới')}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={resetForm}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="users-list-section">
          <h3>Danh Sách Người Dùng</h3>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Họ Tên</th>
                  <th>Email</th>
                  <th>Số Điện Thoại</th>
                  <th>Vai Trò</th>
                  <th>Trạng Thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      {user.role === 'admin' ? 'Quản trị viên' :
                       user.role === 'editor' ? 'Biên tập viên' : 'Người dùng'}
                    </td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status === 'active' ? 'Hoạt động' :
                         user.status === 'inactive' ? 'Không hoạt động' : 'Bị cấm'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(user)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user._id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;