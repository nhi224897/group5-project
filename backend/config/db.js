const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("🔍 MONGO_URI =", process.env.MONGO_URI); // 👈 Dòng này để debug

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            family: 4, // ép dùng IPv4
        });

        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection failed: ${error.message}`);
    }
};

module.exports = connectDB;
