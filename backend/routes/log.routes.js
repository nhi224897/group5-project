const express = require('express');
const router = express.Router();
const { getLogs, deleteLogs, exportLogs } = require('../controllers/log.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Bạn không có quyền truy cập tính năng này' });
  }
};

// Lấy danh sách logs (chỉ admin)
router.get('/', authenticateToken, isAdmin, getLogs);

// Xóa logs cũ (chỉ admin)
router.delete('/', authenticateToken, isAdmin, deleteLogs);

// Xuất logs (chỉ admin)
router.get('/export', authenticateToken, isAdmin, exportLogs);

module.exports = router;