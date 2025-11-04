const mongoose = require('mongoose');
const crypto = require('crypto'); // Cần để tạo token reset mật khẩu

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng thêm tên'],
        trim: true,
        maxlength: [50, 'Tên không được vượt quá 50 ký tự']
    },
    email: {
        type: String,
        required: [true, 'Vui lòng thêm email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Vui lòng điền một email hợp lệ'
        ]
    },
    password: {
        type: String,
        required: [true, 'Vui lòng thêm mật khẩu'],
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
        select: false // KHÔNG trả về mật khẩu khi tìm kiếm (trừ khi được chỉ định rõ)
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Hai trường này cần cho tính năng Forgot Password
    resetPasswordToken: String, 
    resetPasswordExpire: Date
});

// ------------------------------------------------------------------
// MONGOOSE METHODS
// ------------------------------------------------------------------

// @desc    Tạo và Hash token reset mật khẩu
// NOTE:    Method này được gọi trong authController.js (forgotPassword)
UserSchema.methods.getResetPasswordToken = function() {
    // 1. Tạo token ngẫu nhiên (dạng raw, sẽ gửi qua email)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash token (dùng SHA256) và lưu vào DB
    // Controller sẽ so sánh token đã hash này
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. Đặt thời gian hết hạn cho token (ví dụ: 10 phút)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 phút

    // Trả về token RAW để gửi qua email
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
