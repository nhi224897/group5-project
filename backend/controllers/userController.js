// ========== userController.js ==========

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshToken'); // Nếu bạn có model Mongo, để nguyên

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Mảng tạm lưu danh sách user (nếu chưa dùng MongoDB)
let users = [];
exports.users = users; // export để nơi khác dùng nếu cần

// Simple in-memory token blacklist cho logout
const tokenBlacklist = new Set();

// Hằng số thời gian hết hạn token
const ACCESS_TOKEN_EXPIRES = '15m';  // 15 phút
const REFRESH_TOKEN_EXPIRES = '7d';  // 7 ngày

// ==========================
// GET: Lấy danh sách tất cả user (ẩn password)
// ==========================
exports.getUsers = (req, res) => {
  const safe = users.map(({ password, ...rest }) => rest);
  res.json(safe);
};

// ==========================
// POST: Tạo user mới
// ==========================
exports.createUser = (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, password là bắt buộc!" });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: "Email đã được sử dụng" });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashed,
    role: role || 'user'
  };

  users.push(newUser);
  const { password: pw, ...safe } = newUser;
  res.status(201).json(safe);
};

// ==========================
// PUT: Sửa user theo ID
// ==========================
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id == id);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  const incoming = { ...req.body };
  if (incoming.password) incoming.password = bcrypt.hashSync(incoming.password, 10);

  users[index] = { ...users[index], ...incoming };
  const { password, ...safe } = users[index];
  res.json(safe);
};

// ==========================
// DELETE: Xóa user theo ID
// ==========================
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  users = users.filter(u => u.id != id);
  res.json({ message: "User deleted" });
};

// ==========================
// SIGNUP
// ==========================
exports.signup = (req, res) => exports.createUser(req, res);

// ==========================
// LOGIN (đã fix cookie + refresh)
// ==========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login:', email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email và password là bắt buộc" });
    }

    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(400).json({ message: "Sai mật khẩu" });

    // 🔑 Tạo access token và refresh token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES }
    );

    // 🧠 Lưu refreshToken vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Đặt true nếu deploy HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // 🧾 Lưu vào DB nếu có model RefreshToken (tùy chọn)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    try {
      await RefreshToken.create({
        token: refreshToken,
        userId: user.id.toString(),
        expiresAt
      });
    } catch (e) {
      console.warn("⚠️ Không lưu RefreshToken vì chưa có MongoDB:", e.message);
    }

    const { password: pw, ...safe } = user;
    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      user: safe
    });

  } catch (err) {
    console.error("Lỗi login:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ==========================
// LOGOUT
// ==========================
exports.logout = (req, res) => {
  res.clearCookie("refreshToken");
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token) tokenBlacklist.add(token);
  res.json({ message: "Đã đăng xuất" });
};

// ==========================
// PROFILE (GET/UPDATE)
// ==========================
exports.getProfile = (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Thiếu token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    const { password, ...safe } = user;
    res.json(safe);
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

exports.updateProfile = (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Thiếu token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const index = users.findIndex(u => u.id === decoded.id);
    if (index === -1) return res.status(404).json({ message: "Không tìm thấy user" });

    const { email, password, ...updateData } = req.body;
    users[index] = { ...users[index], ...updateData };
    const { password: pw, ...safe } = users[index];
    res.json(safe);
  } catch {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// ==========================
// REFRESH TOKEN (dùng cookie)
// ==========================
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is missing or expired" });
  }

  try {
    // ✅ Xác minh JWT
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    // ✅ Kiểm tra token trong DB (nếu có)
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      expiresAt: { $gt: new Date() }
    });
    if (!storedToken) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn trong DB" });
    }

    // ✅ Tìm user trong mảng
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // ✅ Tạo access token mới
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Lỗi refresh token:", err);
    res.clearCookie("refreshToken");
    res.status(401).json({ message: "Refresh token không hợp lệ" });
  }
};
