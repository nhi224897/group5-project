require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌ MISSING MONGO_URI. Set the MONGO_URI environment variable (do NOT hardcode credentials).");
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Kết nối MongoDB thành công!");
    const db = client.db("mongo");
    const collection = db.collection("products");

    const result = await collection.insertOne({ name: "Coca Cola", price: 15000 });
    console.log("Đã thêm:", result.insertedId);
  } catch (e) {
    console.error("❌ Lỗi kết nối:", e);
  } finally {
    try { await client.close(); } catch (e) { /* ignore close errors */ }
  }
}

run();