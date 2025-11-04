const express = require("express");
const router = express.Router();
// Tải các hàm trực tiếp từ userController
const { getAllUsers, createUser, updateUser, deleteUser, getProfile, updateProfile } = require('../controllers/userController'); 
// Tải các hàm Middleware (protect, admin)
const { protect, admin } = require('../middleware/authMiddleware'); 

// ----------------------------------------------------
// Hoạt động 1: Quản lý User (Chỉ Admin)
// ----------------------------------------------------
router.route('/users')
    // GET /api/users (Admin có thể xem danh sách)
    .get(protect, admin, getAllUsers) 
    // POST /api/users (Admin có thể tạo người dùng mới)
    .post(protect, admin, createUser); 

// ----------------------------------------------------
// Hoạt động 2: Cập nhật và Xóa người dùng theo ID (Chỉ Admin)
// ----------------------------------------------------
router.route('/users/:id')
    // PUT /api/users/:id (Admin có thể cập nhật thông tin người dùng khác)
    .put(protect, admin, updateUser) 
    // DELETE /api/users/:id (Admin có thể xóa người dùng khác)
    .delete(protect, admin, deleteUser); 

// ----------------------------------------------------
// Hoạt động 3: Quản lý Profile Cá nhân (User đã đăng nhập)
// API Endpoint: /api/profile
// Yêu cầu: Chỉ cần Đăng nhập (protect)
// ----------------------------------------------------
router.route('/profile')
    // GET /api/profile (Xem thông tin user đang đăng nhập)
    .get(protect, getProfile)
    // PUT /api/profile (Cập nhật thông tin user đang đăng nhập)
    .put(protect, updateProfile);

module.exports = router;
