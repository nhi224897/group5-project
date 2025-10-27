// ========== userController.js ==========

// Mảng tạm lưu danh sách user (nếu chưa dùng MongoDB)
let users = [];

// ==========================
// GET: Lấy danh sách tất cả user
// ==========================
exports.getUsers = (req, res) => {
  res.json(users);
};

// ==========================
// POST: Thêm user mới (có validation)
// ==========================
exports.createUser = (req, res) => {
  const { name, email } = req.body;

  // 1️⃣ Kiểm tra nếu thiếu name hoặc email
  if (!name || !email) {
    return res.status(400).json({ message: "Name và Email là bắt buộc!" });
  }

  // 2️⃣ Kiểm tra định dạng email hợp lệ
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  // 3️⃣ Nếu hợp lệ → thêm user mới
  const newUser = {
    id: Date.now(),
    name,
    email,
  };

  users.push(newUser);
  res.status(201).json(newUser);
};

// ==========================
// PUT: Sửa thông tin user theo ID
// ==========================
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id == id);

  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// ==========================
// DELETE: Xóa user theo ID
// ==========================
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  users = users.filter(u => u.id != id);
  res.json({ message: "User deleted" });
};

// ========== Hết file ==========