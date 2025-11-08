const Log = require('../models/Log');

// Lấy danh sách logs với phân trang và lọc
exports.getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const action = req.query.action;
    const status = req.query.status;
    const userId = req.query.userId;

    let query = {};

    // Thêm các điều kiện lọc
    if (startDate && endDate) {
      query.timestamp = { $gte: startDate, $lte: endDate };
    }
    if (action) {
      query.action = action;
    }
    if (status) {
      query.status = status;
    }
    if (userId) {
      query.user = userId;
    }

    const total = await Log.countDocuments(query);
    const logs = await Log.find(query)
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy logs:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy logs' });
  }
};

// Xóa logs cũ
exports.deleteLogs = async (req, res) => {
  try {
    const { days } = req.body;
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await Log.deleteMany({
      timestamp: { $lt: date }
    });

    res.json({
      message: `Đã xóa ${result.deletedCount} logs cũ hơn ${days} ngày`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Lỗi khi xóa logs:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra khi xóa logs' });
  }
};

// Xuất logs ra file
exports.exportLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const logs = await Log.find(query)
      .populate('user', 'name email')
      .sort({ timestamp: -1 });

    // Chuyển đổi logs thành CSV
    const fields = ['Thời gian', 'Người dùng', 'Hành động', 'Trạng thái', 'IP', 'Chi tiết'];
    const csvData = logs.map(log => ({
      'Thời gian': log.timestamp.toLocaleString('vi-VN'),
      'Người dùng': log.user ? `${log.user.name} (${log.user.email})` : 'N/A',
      'Hành động': log.action,
      'Trạng thái': log.status,
      'IP': log.ipAddress,
      'Chi tiết': log.details
    }));

    res.attachment('logs.csv');
    res.status(200).send(
      [fields.join(',')].concat(
        csvData.map(row => 
          fields.map(field => 
            JSON.stringify(row[field] || '')
          ).join(',')
        )
      ).join('\n')
    );
  } catch (error) {
    console.error('Lỗi khi xuất logs:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra khi xuất logs' });
  }
};