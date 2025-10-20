let users = []; // mảng tạm để lưu user

// Lấy danh sách user
exports.getUsers = (req, res) => {
  res.json(users);
};

// Thêm user mới
exports.createUser = (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
};
