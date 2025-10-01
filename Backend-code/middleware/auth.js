const jwt = require('jsonwebtoken');
const User = require('../models/user');

console.log("[DEBUG] Middleware file loaded successfully");
console.log("JWT Secret exists:", !!process.env.JWT_SECRET);

// const auth = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId);
    
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.log("Auth Error:", error.message);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user with full profile
    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};


module.exports = auth;