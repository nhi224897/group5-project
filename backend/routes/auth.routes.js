const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');
const { authenticateToken } = require('../middleware/auth.middleware');
const nodemailer = require('nodemailer');

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo access token và refresh token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Lưu refresh token vào database
    await Token.create({
      userId: user._id,
      token: refreshToken
    });

    // Trả về tokens và thông tin user
    res.json({
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token không tồn tại' });
    }

    // Kiểm tra refresh token trong database
    const tokenDoc = await Token.findOne({ token: refreshToken });
    if (!tokenDoc) {
      return res.status(401).json({ message: 'Refresh token không hợp lệ' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Tạo access token mới
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Tạo refresh token mới
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Cập nhật refresh token trong database
    await Token.findByIdAndUpdate(tokenDoc._id, { token: newRefreshToken });

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Refresh token đã hết hạn' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng xuất
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Xóa refresh token khỏi database
    await Token.deleteMany({ userId: req.userId });
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Quên mật khẩu
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    // Tạo token đặt lại mật khẩu
    const resetToken = user.createResetPasswordToken();
    await user.save();

    // Tạo URL đặt lại mật khẩu
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Cấu hình nodemailer
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Nội dung email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <h1>Yêu cầu đặt lại mật khẩu</h1>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
        <a href="${resetUrl}">Đặt lại mật khẩu</a>
        <p>Link này sẽ hết hạn sau 10 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: 'Email hướng dẫn đặt lại mật khẩu đã được gửi'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.'
    });
  }
});

// Đặt lại mật khẩu
router.post('/reset-password/:token', async (req, res) => {
  try {
    // Lấy token từ params và mã hóa
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Tìm user với token và kiểm tra hạn
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'
      });
    }

    // Đặt mật khẩu mới
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.'
    });
  }
});

module.exports = router;