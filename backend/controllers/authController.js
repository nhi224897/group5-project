const User = require('../models/User'); // Import Model User
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
const jwt = require('jsonwebtoken'); // Thư viện tạo JWT
const crypto = require('crypto'); // Cần cho Quên/Đặt lại Mật khẩu
const sendEmail = require('../utils/sendEmail'); // <<< ĐÃ THÊM: Import hàm gửi email

// @desc    Tạo JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token hết hạn sau 30 ngày
    });
};

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Kiểm tra trường rỗng
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường.' });
    }

    // 2. Kiểm tra tồn tại
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Người dùng đã tồn tại.' });
    }

    // 3. Quyết định Role: Nếu chưa có người dùng nào, người dùng này là Admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    // 4. Hash Mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Tạo người dùng
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
            message: 'Đăng ký thành công!',
        });
    } else {
        res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ.' });
    }
};

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. Tìm người dùng theo email
    const user = await User.findOne({ email }).select('+password'); // Cần select password để so sánh

    // 2. Kiểm tra tồn tại và so sánh mật khẩu
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
            message: 'Đăng nhập thành công!',
        });
    } else {
        res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ.' }); // 401 Unauthorized
    }
};

// @desc    Đăng xuất người dùng
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
    // Trong kiến trúc JWT Stateless:
    // Logout chủ yếu là xóa token phía Client (thông qua React). 
    // Phía Server chỉ cần gửi phản hồi thành công.
    res.status(200).json({ message: 'Đăng xuất thành công.' });
};


// @desc    Quên mật khẩu (Gửi email reset)
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    // 1. Tìm người dùng theo email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        // Luôn trả về 200/201 để tránh lộ thông tin email nào tồn tại
        return res.status(200).json({ message: 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.' });
    }

    // 2. Tạo Token Reset (dùng Mongoose method từ User Model)
    const resetToken = user.getResetPasswordToken(); 

    // 3. Lưu token đã hash vào DB
    await user.save({ validateBeforeSave: false }); // Lưu DB mà không chạy validator

    // 4. Tạo URL reset
    // **LƯU Ý:** Bạn cần thay thế địa chỉ IP/domain này bằng địa chỉ của frontend khi deploy thật
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    
    // 5. Định nghĩa nội dung email (sử dụng HTML cho đẹp hơn)
    const message = `
        <h3>Yêu cầu Đặt lại Mật khẩu</h3>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấp vào liên kết dưới đây:</p>
        <p><a href="${resetUrl}" target="_blank"><strong>Nhấp vào đây để Đặt lại Mật khẩu</strong></a></p>
        <p>Liên kết này sẽ hết hạn sau 10 phút.</p>
        <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
        <br>
        <p>Trân trọng,</p>
        <p>Đội ngũ Hỗ trợ</p>
    `;

    const emailOptions = {
        email: user.email,
        subject: 'Đặt lại Mật khẩu (Password Reset Token)',
        message: message
    };

    console.log(`Reset Token: ${resetToken}`);
    console.log(`Reset URL: ${resetUrl}`);
    
    try {
        // Gửi email
        await sendEmail(emailOptions);
        
        res.status(200).json({ success: true, message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.' });

    } catch (error) {
        // Đặt lại trường token và thời gian hết hạn nếu gửi email thất bại
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        console.error("Lỗi gửi email:", error.message);
        res.status(500).json({ success: false, error: 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.' });
    }
};

// @desc    Đặt lại mật khẩu với Token
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
    // 1. Hash token từ URL để so sánh với token đã lưu trong DB
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    // 2. Tìm người dùng có token đã hash và token chưa hết hạn
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }, // Kiểm tra token còn hạn không
    }).select('+password'); // Cần select password để cập nhật

    if (!user) {
        return res.status(400).json({ message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
    }

    // 3. Kiểm tra mật khẩu mới
    if (!req.body.password || req.body.password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    // 4. Hash và cập nhật mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // 5. Xóa các trường token/expire
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    // 6. Trả về phản hồi thành công và token đăng nhập mới
    res.status(200).json({ 
        success: true, 
        message: 'Mật khẩu đã được đặt lại thành công.',
        token: generateToken(user._id, user.role) // Trả về token mới để đăng nhập luôn
    });
};


module.exports = { 
    registerUser, 
    loginUser,
    logoutUser, 
    forgotPassword, 
    resetPassword 
};
