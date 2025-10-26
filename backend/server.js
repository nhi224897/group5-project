// server.js

const express = require('express');
const app = express();
const userRoutes = require('./routes/user');

// Middleware để đọc JSON body
app.use(express.json());

// Sử dụng route /users
app.use('/users', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
