// ========== userController.js ==========

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshToken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Mảng tạm lưu danh sách user (nếu chưa dùng MongoDB)
let users = [];
exports.users = users; // thêm dòng này để export

// Simple in-memory token blacklist cho logout
const tokenBlacklist = new Set();

// Thêm các hằng số cho thời gian hết hạn
const ACCESS_TOKEN_EXPIRES = '15m';  // 15 phút
const REFRESH_TOKEN_EXPIRES = '7d';   // 7 ngày 

// ==========================
// GET: Lấy danh sách tất cả user (không trả password)
// ==========================
exports.getUsers = (req, res) => {
  const safe = users.map(({ password, ...rest }) => rest);
  res.json(safe);
};

// ==========================
// POST: Thêm user mới (có validation)
// ==========================
exports.createUser = (req, res) => {
  const { name, email, password, role } = req.body; // allow role optional

  if (!name || !email) {
    return res.status(400).json({ message: "Name và Email là bắt buộc!" });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password là bắt buộc!" });
  }

  // Kiểm tra email đã tồn tại
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: "Email đã được sử dụng" });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashed,
    role: role || 'user' // <-- thêm role mặc định
  };

  users.push(newUser);

  const { password: pw, ...safe } = newUser;
  res.status(201).json(safe);
};

// ==========================
// PUT: Sửa thông tin user theo ID
// ==========================
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id == id);

  if (index !== -1) {
    // Nếu cập nhật password thì băm lại
    const incoming = { ...req.body };
    if (incoming.password) {
      incoming.password = bcrypt.hashSync(incoming.password, 10);
    }
    users[index] = { ...users[index], ...incoming };
    const { password, ...safe } = users[index];
    res.json(safe);
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

// ==========================
// Auth: Signup
// POST /signup
// ==========================
exports.signup = (req, res) => {
  // reuse createUser logic for signup
  return exports.createUser(req, res);
};

// ==========================
// Auth: Login
// POST /login
// Body: { email, password }
// ==========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Add detailed logging
    console.log('Login attempt:', { email, password });
    console.log('All users in memory:', users);

    if (!email || !password) {
      return res.status(400).json({ message: "Email và password là bắt buộc" });
    }

    const user = users.find(u => u.email === email);
    console.log('Found user:', user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = bcrypt.compareSync(password, user.password);
    console.log('Password match:', ok);

    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create tokens
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

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      token: refreshToken,
      userId: user.id.toString(),
      expiresAt
    });

    const { password: pw, ...safe } = user;
    res.json({
      accessToken,
      refreshToken,
      user: safe
    });

  } catch (err) {
    console.error('Login error:', err); // Log chi tiết lỗi
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// ==========================
// Auth: Logout
// POST /logout
// Header: Authorization: Bearer <token>
// ==========================
exports.logout = (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(400).json({ message: "Token required in Authorization header" });
  tokenBlacklist.add(token);
  res.json({ message: "Logged out" });
};

// helper: check token blacklist (can use in middleware if cần)
exports.isTokenBlacklisted = (token) => tokenBlacklist.has(token);

// ==========================
// GET: Xem thông tin profile
// GET /profile
// Requires: Authorization header with token
// ==========================
exports.getProfile = (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const { password, ...profile } = user;
    res.json(profile);
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// ==========================
// PUT: Cập nhật thông tin profile
// PUT /profile
// Requires: Authorization header with token
// ==========================
exports.updateProfile = (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const index = users.findIndex(u => u.id === decoded.id);
    
    if (index === -1) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    // Không cho phép thay đổi email qua API này
    const { email, password, ...updateData } = req.body;
    
    users[index] = {
      ...users[index],
      ...updateData,
      updatedAt: new Date()
    };

    const { password: pw, ...profile } = users[index];
    res.json(profile);
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// Thêm API refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token là bắt buộc' });
  }

  try {
    // Kiểm tra token có tồn tại và còn hạn trong DB
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      expiresAt: { $gt: new Date() }
    });

    if (!storedToken) {
      return res.status(401).json({ message: 'Refresh token không hợp lệ' });
    }

    // Verify JWT
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Không tìm thấy user' });
    }

    // Tạo access token mới
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    res.json({ accessToken });

  } catch (err) {
    console.error('Lỗi refresh token:', err);
    res.status(401).json({ message: 'Refresh token không hợp lệ' });
  }
};