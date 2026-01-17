const jwt = require('jsonwebtoken');

// Verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded; // { userId, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

// Check if user is authenticated (either user or admin)
const isAuthenticated = verifyToken;

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      req.user = decoded;
    }
  } catch (error) {
    // Token invalid but don't fail
    req.user = null;
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isAuthenticated,
  optionalAuth
};

