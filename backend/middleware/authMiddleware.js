const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Cần import Model User

// @desc    Xác thực JWT Token và gắn User vào request
// @usage   Dùng cho các route yêu cầu Đăng nhập (Private)
const protect = async (req, res, next) => {
    let token;

    // 1. Kiểm tra Token trong Header Authorization
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ chuỗi 'Bearer <token>'
            token = req.headers.authorization.split(' ')[1];

            // 2. Xác thực Token (Verify)
            // Giải mã token để lấy payload (chứa {id, role})
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Gắn thông tin người dùng vào req.user (không bao gồm password)
            // Đây là cách Controller (ví dụ: getProfile) truy cập user ID: req.user.id
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Token không hợp lệ, không tìm thấy người dùng.' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Không có token, truy cập bị từ chối.' });
    }
};

// @desc    Kiểm tra vai trò Admin
// @usage   Dùng sau middleware 'protect'
const admin = (req, res, next) => {
    // Middleware 'protect' đã chạy trước, đảm bảo req.user tồn tại
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        // 403 Forbidden
        res.status(403).json({ message: 'Truy cập bị từ chối. Chỉ Admin mới có quyền thực hiện chức năng này.' });
    }
};

module.exports = { protect, admin };
