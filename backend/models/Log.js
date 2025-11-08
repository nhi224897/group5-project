const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESET_PASSWORD', 'UPLOAD_AVATAR']
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['SUCCESS', 'FAILURE']
  },
  details: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Tạo index cho trường timestamp để tối ưu truy vấn
logSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);