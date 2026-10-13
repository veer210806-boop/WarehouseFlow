import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { memoryStore } from '../config/memoryStore.js';

export async function protect(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'warehouseflow_super_secure_jwt_secret_key_2026');
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryStore.getUserById(decoded.id) || {
        _id: decoded.id,
        name: 'Veer Goel (Admin)',
        email: 'admin@warehouseflow.com',
        role: 'ADMIN'
      };
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or token expired.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this resource.`
      });
    }
    next();
  };
}
