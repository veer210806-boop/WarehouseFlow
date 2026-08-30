import mongoose from 'mongoose';

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/warehouseflow';
  
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3500, // Quick timeout to detect local MongoDB
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Warning: MongoDB connection failed (${error.message}).`);
    console.log(`ℹ️ Tip: Ensure MongoDB service is started or update MONGO_URI in .env.`);
    return false;
  }
}
