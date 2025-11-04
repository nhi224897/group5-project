const express = require('express');
const router = express.Router();
// Tải các hàm trực tiếp từ authController
// Bổ sung logout, forgotPassword, resetPassword
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');

// Tải Middleware bảo vệ route (cho Logout)
const { protect } = require('../middleware/authMiddleware');

// ----------------------------------------------------
// Hoạt động 1: Đăng ký & Đăng nhập (Public)
// ----------------------------------------------------

// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

// ----------------------------------------------------
// Hoạt động 2: Đăng xuất (Private)
// ----------------------------------------------------

// @route   POST /api/auth/logout
// @access  Private (Cần Token)
router.post('/logout', protect, logoutUser); 

// ----------------------------------------------------
// Hoạt động 4: Quên & Đặt lại Mật khẩu (Public)
// ----------------------------------------------------

// @route   POST /api/auth/forgotpassword
// @access  Public (Gửi email chứa token reset)
router.post('/forgotpassword', forgotPassword);

// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public (Sử dụng token để đặt lại mật khẩu)
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;
