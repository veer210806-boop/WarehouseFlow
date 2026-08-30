import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDatabase } from './seed/seedData.js';
import Product from './models/Product.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reorderRoutes from './routes/reorderRoutes.js';
import batchRoutes from './routes/batchRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database & Auto-Seed if empty
connectDB().then(async (connected) => {
  if (connected) {
    try {
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        console.log('⚡ Empty database detected. Auto-seeding initial sample data...');
        await seedDatabase();
      }
    } catch (err) {
      console.warn('Auto-seed check note:', err.message);
    }
  }
});

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reorder', reorderRoutes);
app.use('/api/batches', batchRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'WarehouseFlow Smart Inventory API',
    timestamp: new Date().toISOString()
  });
});

// Manual Seed Endpoint
app.post('/api/seed', async (req, res, next) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully with realistic warehouse data!' });
  } catch (err) {
    next(err);
  }
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 WarehouseFlow Backend API running on http://localhost:${PORT}`);
});
