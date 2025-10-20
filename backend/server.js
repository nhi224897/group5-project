const express = require('express');
const app = express();
const userRoutes = require('./routes/user'); // <-- thêm dòng này hoạt động 3
// Middleware để đọc dữ liệu JSON
app.use(express.json());
app.use('/', userRoutes); // <-- và thêm dòng này hoạt động 3
// Cổng mặc định
const PORT = process.env.PORT || 3000;

// Chạy server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
