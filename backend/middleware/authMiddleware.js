const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token = null;

    // lấy token từ header Authorization: Bearer xxxxxx
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // ko có token
    if (!token) {
        return res.status(401).json({ message: 'Không có token, truy cập bị từ chối.' });
    }

    try {
        // verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // gán user vào req.user
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'Token không hợp lệ, không tìm thấy người dùng.' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

const admin = (req, res, next) => {
    if (req.user?.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Chỉ Admin mới có quyền.' });
};

module.exports = { protect, admin };
