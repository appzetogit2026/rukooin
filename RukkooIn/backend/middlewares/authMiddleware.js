import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('🛡️ Auth Middleware - Decoded Payload:', decoded);

    let user;

    // Check based on role if available in token, otherwise try all
    if (decoded.role === 'partner') {
      user = await Partner.findById(decoded.id);
    } else if (decoded.role === 'admin' || decoded.role === 'superadmin') {
      user = await Admin.findById(decoded.id);
    } else {
      // Default to User
      user = await User.findById(decoded.id);
    }

    // Fallback: If not found by role (e.g. role changed or token old format), try others
    if (!user) {
      // console.log('🛡️ Auth Middleware - Not found by role, trying others...');
      if (decoded.role !== 'partner') user = await Partner.findById(decoded.id);
      if (!user && decoded.role !== 'admin') user = await Admin.findById(decoded.id);
      if (!user && decoded.role !== 'user') user = await User.findById(decoded.id);
    }

    if (!user) {
      // console.warn('🛡️ Auth Middleware - No User/Partner/Admin found for ID:', decoded.id);
      return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
    }

    // console.log(`🛡️ Auth Middleware - Authorized: ${user.name || 'User'} (${user.role})`);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.error('🛡️ Auth Middleware - Invalid Token:', error.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      console.error('🛡️ Auth Middleware - Token Expired');
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('🛡️ Auth Middleware Error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};
