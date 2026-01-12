import jwt from 'jsonwebtoken';
import User from '../models/User.js';
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
    console.log('🛡️ Auth Middleware - Decoded Payload:', decoded);

    // Check in User collection
    let user = await User.findById(decoded.id);

    // If not found in User, check in Admin collection
    if (!user) {
      console.log('🛡️ Auth Middleware - User not found, checking Admin collection for ID:', decoded.id);
      user = await Admin.findById(decoded.id);
    }

    if (!user) {
      console.warn('🛡️ Auth Middleware - No User/Admin found for ID:', decoded.id);
      return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
    }

    console.log(`🛡️ Auth Middleware - Authorized: ${user.name} (${user.role})`);
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
