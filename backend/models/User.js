const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập địa chỉ email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Địa chỉ email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có tối thiểu 6 ký tự']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'editor'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Số điện thoại không hợp lệ']
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'banned'],
      message: 'Trạng thái không hợp lệ'
    },
    default: 'active'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Tạo chuỗi ngẫu nhiên để tăng độ bảo mật
    const salt = await bcrypt.genSalt(10);
    // Mã hóa mật khẩu với chuỗi salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(new Error('Có lỗi khi mã hóa mật khẩu'));
  }
});

// Phương thức so sánh mật khẩu đã nhập với mật khẩu đã mã hóa
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Có lỗi khi kiểm tra mật khẩu');
  }
};

// Phương thức tạo mã thông báo để đặt lại mật khẩu
userSchema.methods.createResetPasswordToken = function() {
  // Tạo mã thông báo ngẫu nhiên
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Mã hóa token và lưu vào cơ sở dữ liệu
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Thiết lập thời gian hết hạn là 10 phút
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);