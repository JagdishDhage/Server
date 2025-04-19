// authenticate.js
const jwt = require('jsonwebtoken');
const User = require('../Model/User');

const authenticate = async (req, res, next) => {
  try {
   
    const token = req.cookies.auth;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    
    
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded || !decoded.user_id) {
      return res.status(401).json({ message: 'Unauthorized bbbbbb',token:token });
    }

    
    const user = await User.findById(decoded.user_id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authenticate;
