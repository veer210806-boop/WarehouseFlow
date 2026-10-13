import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { memoryStore } from '../config/memoryStore.js';

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'warehouseflow_super_secure_jwt_secret_key_2026', {
    expiresIn: '30d'
  });
}

// @desc    Register a new user
// @route   POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (mongoose.connection.readyState !== 1) {
      // In-memory fallback
      const token = generateToken('usr_' + Date.now());
      const user = {
        id: 'usr_' + Date.now(),
        name,
        email: email.toLowerCase(),
        role: role || 'ADMIN'
      };
      return res.status(201).json({ success: true, token, user });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'ADMIN'
    });

    const token = generateToken(user._id);

    await ActivityLog.create({
      action: 'User Registered',
      entityType: 'SYSTEM',
      details: `${user.name} (${user.role}) registered an account.`,
      badgeType: 'SUCCESS'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Login user & get token
// @route   POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    if (mongoose.connection.readyState !== 1) {
      // In-memory fallback for cloud live demo
      const memoryUser = memoryStore.getUserByEmail(email);
      if (memoryUser) {
        const token = generateToken(memoryUser._id);
        return res.json({
          success: true,
          token,
          user: {
            id: memoryUser._id,
            name: memoryUser.name,
            email: memoryUser.email,
            role: memoryUser.role
          }
        });
      }
      // Allow any demo login if password matches admin123
      if (password === 'admin123') {
        const token = generateToken('usr_demo');
        return res.json({
          success: true,
          token,
          user: {
            id: 'usr_demo',
            name: email.includes('admin') ? 'Veer Goel (Admin)' : 'Rohan Gupta (Warehouse Mgr)',
            email: email.toLowerCase(),
            role: email.includes('admin') ? 'ADMIN' : 'WAREHOUSE_MANAGER'
          }
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get current user profile
// @route   GET /api/auth/me
export async function getMe(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, user: req.user });
    }
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}
