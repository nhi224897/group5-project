// middleware/auth.js (Đã sửa lỗi bảo mật)

const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('../controllers/userController'); 

// SỬ DỤNG SECRET RIÊNG CHO ACCESS TOKEN
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret'; 

function authorize(requiredRole = null) {
  return (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Yêu cầu token", code: "TOKEN_REQUIRED" });
    }
    
    // BẮT BUỘC: Kiểm tra Blacklist trước khi xác thực (Khắc phục Logout)
    if (isTokenBlacklisted(token)) {
        return res.status(403).json({ message: "Token đã bị thu hồi (Logout)", code: "TOKEN_REVOKED" });
    }

    try {
      // 1. Xác thực bằng ACCESS SECRET
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET); 
      req.user = decoded;

      // 2. Logic RBAC (Giữ nguyên)
      if (requiredRole) {
        const role = (decoded.role || '').toString().toLowerCase();
        if (role !== requiredRole.toString().toLowerCase()) {
          return res.status(403).json({ message: "Không có quyền truy cập" });
        }
      }
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Trả về 401 để Client gọi /auth/refresh
        return res.status(401).json({ 
          message: "Access Token đã hết hạn",
          code: "TOKEN_EXPIRED"
        });
      }
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
  };
}

module.exports = { authorize };