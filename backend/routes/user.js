const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authorize } = require('../middleware/auth'); // 1. IMPORT MIDDLEWARE authorize

// ==========================
// A. AUTH ROUTES (Không cần bảo vệ)
// ==========================
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// 2. BẮT BUỘC: API Refresh Token (Hoạt động 1 của SV1)
router.post('/auth/refresh', userController.refreshToken); 


// ==========================
// B. PROFILE ROUTES (Yêu cầu Xác thực - Hoạt động 2)
// ==========================
// Lấy thông tin Profile: authorize(null) chỉ yêu cầu token hợp lệ, không cần vai trò cụ thể
router.get('/profile', authorize(null), userController.getProfile); 

// Cập nhật Profile: authorize(null)
router.put('/profile', authorize(null), userController.updateProfile); 


// ==========================
// C. ADMIN ROUTES (Yêu cầu Phân quyền - Hoạt động 3)
// ==========================
// Xem danh sách user: authorize('admin') yêu cầu token hợp lệ VÀ vai trò 'admin'
router.get('/users', authorize('admin'), userController.getUsers); 

// Xóa user: authorize('admin')
router.delete('/users/:id', authorize('admin'), userController.deleteUser); 


// Debug route
router.get('/debug/users', (req, res) => {
  const users = userController.users;
  console.log('Current users:', users);
  res.json(users.map(({password, ...rest}) => rest));
});

module.exports = router;