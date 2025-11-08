const Log = require('../models/Log');

const logAction = async (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Lấy thông tin người dùng từ request
  const userId = req.userId;
  const action = req.logAction; // Được set từ route
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');

  res.send = function (data) {
    const status = res.statusCode >= 200 && res.statusCode < 400 ? 'SUCCESS' : 'FAILURE';
    const details = typeof data === 'string' ? data : JSON.stringify(data);

    // Tạo log
    Log.create({
      user: userId,
      action,
      ipAddress,
      userAgent,
      status,
      details: details.substring(0, 500) // Giới hạn độ dài
    }).catch(err => console.error('Lỗi khi ghi log:', err));

    originalSend.apply(res, arguments);
  };

  res.json = function (data) {
    const status = res.statusCode >= 200 && res.statusCode < 400 ? 'SUCCESS' : 'FAILURE';
    
    // Tạo log
    Log.create({
      user: userId,
      action,
      ipAddress,
      userAgent,
      status,
      details: JSON.stringify(data).substring(0, 500)
    }).catch(err => console.error('Lỗi khi ghi log:', err));

    originalJson.apply(res, arguments);
  };

  next();
};

module.exports = logAction;