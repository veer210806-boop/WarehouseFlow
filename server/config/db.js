import mongoose from 'mongoose';

let cachedConnection = null;

export async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return true;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('ℹ️ [WarehouseFlow] No MONGO_URI provided — using In-Memory Warehouse Engine for Live Demo.');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      bufferCommands: false // Fail fast rather than hanging on serverless
    });
    cachedConnection = conn;
    console.log(`✅ [WarehouseFlow] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [WarehouseFlow] MongoDB connection failed (${error.message}). Using In-Memory Warehouse Engine.`);
    return false;
  }
}
