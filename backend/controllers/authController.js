// ======================================
// SINH VIÊN 1 - HOÀN THÀNH CÁC CHỨC NĂNG
// Register, Login, Logout, Forgot Password, Reset Password
// ======================================

const User = require('../models/User');
const crypto = require('crypto');

// ===========================================
// REGISTER
// ===========================================
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // check email tồn tại
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // tạo user (MODEL sẽ tự hash password)
        const user = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({
            message: 'Đăng ký thành công',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===========================================
// LOGIN
// ===========================================
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // CẦN SELECT PASSWORD
        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });

        const match = await user.matchPassword(password);
        if (!match) return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });

        const token = user.getSignedJwtToken();

        res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===========================================
// LOGOUT
// ===========================================
exports.logoutUser = (req, res) => {
    res.status(200).json({ message: "Đăng xuất thành công" });
};

// ===========================================
// FORGOT PASSWORD
// ===========================================
exports.forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        message: "Token tạo thành công",
        resetToken
    });
};

// ===========================================
// RESET PASSWORD
// ===========================================
exports.resetPassword = async (req, res) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Token hết hạn hoặc không hợp lệ" });

    user.password = req.body.password; // model tự hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
};
