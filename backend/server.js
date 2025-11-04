const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path"); 

// GIẢI PHÁP CHUẨN: Dùng dotenv.config() và ĐẢM BẢO file .env nằm trong thư mục backend/
dotenv.config();

// Import logic kết nối DB và các routes
const connectDB = require("./config/db"); // Hàm connectDB là ASYNC
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user"); 

const app = express();

// Middleware
app.use(cors()); // Cho phép Frontend truy cập
app.use(express.json()); // Cho phép server đọc dữ liệu JSON trong request body

// ----------------------------------------------------
// ĐĂNG KÝ CÁC ROUTES
// ----------------------------------------------------

// 1. Route Authentication (Sign Up, Login, Logout)
app.use("/api/auth", authRoutes);

// 2. Route Quản lý User/CRUD/Profile (Cần Auth Middleware để bảo vệ)
// Các API sẽ có dạng: /api/users (Admin), /api/profile (User)
app.use("/api", userRoutes); 


// Route kiểm tra cơ bản
app.get('/', (req, res) => {
    res.send('API is running...');
});


// ----------------------------------------------------
// TỐI ƯU HÓA LOGIC KHỞI ĐỘNG SERVER
// Server chỉ lắng nghe (listen) SAU KHI Database kết nối thành công
// ----------------------------------------------------

const startServer = async () => {
    try {
        // Đợi kết nối DB hoàn tất thành công
        await connectDB(); 

        // Nếu kết nối DB thành công, khởi động Server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); 
        
    } catch (error) {
        // Nếu connectDB() thất bại, hàm sẽ ném ra lỗi
        // Bắt lỗi tại đây và thoát ứng dụng
        console.error("❌ Fatal error: Database connection failed. Exiting...");
        process.exit(1); 
    }
};

startServer();
