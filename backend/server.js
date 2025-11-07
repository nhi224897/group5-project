const express = require('express');
const mongoose = require('mongoose'); // <--- DÒNG NÀY PHẢI CÓ!
require('dotenv').config();

const app = express();
app.use(express.json());

// Cần sử dụng tên miền mới: cluster0.kyfxsc0.mongodb.net
const FALLBACK_URI = "mongodb+srv://nhi224897_db_user:224897@cluster0.kyfxsc0.mongodb.net/group5-project?retryWrites=true&w=majority"; 

// ...

// Lấy giá trị từ process.env.MONGODB_URI. Nếu undefined, dùng FALLBACK_URI.
const MONGODB_URI_TO_CONNECT = process.env.MONGODB_URI || FALLBACK_URI;

// Thêm timeout options
mongoose.connect(MONGODB_URI_TO_CONNECT, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000
})
.then(() => console.log('✅ Đã kết nối MongoDB Atlas thành công'))
.catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Dán vào đây để kiểm tra:
console.log(`Đang cố gắng kết nối với URI: ${MONGODB_URI_TO_CONNECT}`);

// ... các đoạn code khác