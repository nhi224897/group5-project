const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route lấy thông tin cá nhân (đã có từ trước)
router.get('/profile', protect, getProfile);

// Route mới: Cập nhật thông tin cá nhân
// Sử dụng protect để đảm bảo chỉ người dùng đã đăng nhập mới được cập nhật
router.put('/profile', protect, updateProfile);

module.exports = router;
