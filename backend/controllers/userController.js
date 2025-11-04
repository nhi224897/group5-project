const User = require('../models/User'); // Đảm bảo Model User đã được tạo
const bcrypt = require('bcryptjs'); // Import bcrypt để hash mật khẩu (khi Admin tạo/cập nhật)

// -----------------------------------------------------------------------------
// PROFILE ENDPOINTS (Dành cho người dùng đã đăng nhập)
// -----------------------------------------------------------------------------

// @desc    Lấy hồ sơ người dùng hiện tại (READ Profile)
// @route   GET /api/profile
// @access  Private (Cần đăng nhập - protect)
const getProfile = async (req, res) => { // <-- Đã đổi tên từ getUserProfile
    // req.user được thêm vào bởi middleware 'protect', chứa thông tin người dùng đã xác thực
    const user = await User.findById(req.user.id).select('-password'); // Bỏ qua trường password
    
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Cập nhật hồ sơ người dùng hiện tại (UPDATE Profile)
// @route   PUT /api/profile
// @access  Private (Cần đăng nhập - protect)
const updateProfile = async (req, res) => { // <-- Đã đổi tên từ updateUserProfile
    // req.user chứa ID của người dùng hiện tại
    const user = await User.findById(req.user.id);

    if (user) {
        // Cập nhật các trường (nếu chúng được gửi lên trong body request)
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // Xử lý cập nhật mật khẩu (nếu có)
        if (req.body.password) {
            if (req.body.password.length < 6) {
                 return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();
        
        // Trả về thông tin người dùng đã cập nhật (không có mật khẩu)
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            message: 'Hồ sơ đã được cập nhật thành công.',
        });

    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// -----------------------------------------------------------------------------
// ADMIN ENDPOINTS (Dành cho Quản lý CRUD)
// -----------------------------------------------------------------------------

// @desc    Lấy tất cả người dùng (READ All)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Bỏ qua trường password
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ success: false, error: 'Server Error: Could not fetch users.' });
    }
};

// @desc    Tạo người dùng mới (CREATE) - Chỉ Admin
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { password } = req.body;

        // 1. Mã hóa mật khẩu trước khi tạo
        if (password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(password, salt);
        } else {
            return res.status(400).json({ message: "Vui lòng cung cấp mật khẩu." });
        }

        // 2. Tạo người dùng (Mongoose tự kiểm tra Schema)
        const user = await User.create(req.body); 
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        console.error("Error creating user:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Cập nhật người dùng theo ID (UPDATE) - Chỉ Admin
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        // Xử lý mã hóa nếu Admin cập nhật mật khẩu
        if (req.body.password) {
            if (req.body.password.length < 6) {
                 return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
            }
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true 
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Xóa người dùng theo ID (DELETE) - Chỉ Admin
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: {} }); 
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ success: false, error: 'Server Error: Could not delete user.' });
    }
};

// Export tất cả các hàm
module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getProfile, 
    updateProfile 
};
