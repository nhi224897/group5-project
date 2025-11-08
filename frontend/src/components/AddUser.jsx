import { useState } from 'react';
import { useUsers } from '../context/UserContext';
import './AddUser.css';

function AddUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const { addUser } = useUsers();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Name không được để trống";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await addUser({ name, email });
    
    if (result.success) {
      // Reset form
      setName('');
      setEmail('');
      setErrors({});
    }
  };

  return (
    <div className="add-user-container">
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <button type="submit" className="submit-button">Add User</button>
      </form>
    </div>
  );
}

export default AddUser;