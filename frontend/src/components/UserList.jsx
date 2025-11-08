import { useUsers } from '../context/UserContext';
import axios from 'axios';
import './UserList.css';
import { useState } from 'react';

function UserList() {
  const { users, loading, error, setUsers } = useUsers();
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });

  if (loading) {
    return <div className="user-list-loading">Loading users...</div>;
  }

  if (error) {
    return <div className="user-list-error">Error: {error}</div>;
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/users/${id}`);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3000/users/${editingUser.id}`, editForm);
      setUsers(users.map(user => 
        user.id === editingUser.id ? response.data : user
      ));
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="user-list-container">
      {editingUser && (
        <div className="edit-form-overlay">
          <form onSubmit={handleUpdate} className="edit-form">
            <h2>Edit User</h2>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={editForm.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-save">Save</button>
              <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="user-grid">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <div className="user-actions">
                <button className="btn-edit" onClick={() => handleEdit(user)}>Sửa</button>
                <button className="btn-delete" onClick={() => handleDelete(user.id)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;