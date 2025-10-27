const express = require('express');
const app = express();

// Giúp server hiểu JSON gửi từ Postman
app.use(express.json());

// Import routes
const userRoutes = require('./routes/user');

// Gắn routes vào server
app.use('/', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
