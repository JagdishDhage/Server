const User = require('../Model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer=require('multer')
const sendEmail=require('../Middlewares/SendEmail')

const Auth = {
  Register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
      }
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      const hashPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashPassword
      });
      
      await user.save();
      
      const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, { expiresIn: '2d' });
      res.cookie('auth', token, {  maxAge: 2 * 24 * 60 * 60 * 1000 });
      res.status(201).json({
        message: 'User created successfully',
        user: { _id: user._id, name: user.name, email: user.email }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  },
  createLogin : async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({
            name,
            email,
            password: hashedPassword, // Store hashed password
            role
        });

        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user: { _id: user._id, name: user.name, email: user.email }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
},
  Admin:async(req,res)=>{
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: 'Admin does not exist' });
      }

      // Check if the user is an admin
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
      }

      const token = jwt.sign({ user_id: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: '2d' });

      res.cookie('auth', token, { maxAge: 2 * 24 * 60 * 60 * 1000 });
      res.status(200).json({
        message: 'Admin logged in successfully',
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  },

  
  Login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
      }
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User does not exist' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
      }
      
      const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, { expiresIn: '2d' });
      res.cookie('auth', token, {  maxAge: 2 * 24 * 60 * 60 * 1000 });
      res.status(200).json({
        message: 'User logged in successfully',
        user: { _id: user._id, name: user.name, email: user.email }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params; // Get token from URL
      const { newPassword } = req.body; // Get password from request body
  
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: "Token and new password are required." });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      if (!decoded) {
        return res.status(400).json({ success: false, message: "Invalid or expired token." });
      }
  
      // Find user by decoded token
      const user = await User.findById(decoded.user_id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
  
      // Hash new password and update
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
  
      res.status(200).json({ success: true, message: "Password reset successfully." });
    } catch (error) {
      console.error(error);
      if (error.name === "JsonWebTokenError") {
        return res.status(400).json({ success: false, message: "Invalid token." });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ success: false, message: "Token has expired." });
      }
      res.status(500).json({ success: false, message: "An error occurred. Please try again." });
    }
  },
  
  
   forgotPassword : async (req, res) => {
    try {
      const { email } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User does not exist" });
      }
  
      const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "10m",
      });
  
      await sendEmail(email, token, user.name);
  
      res.status(200).json({ message: "Reset password link sent to your email",success: true });
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  
  
  Logout: async (req, res) => {
    try {
      res.clearCookie('auth');
      res.status(200).json({ message: 'User logged out successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // This handler now expects that a valid req.user was attached by a middleware.
  getCurrentUser: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      res.status(200).json(req.user);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  },
  UpdateUser: async (req, res) => {
    try {
      console.log('1')
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Build the update object based on the incoming request
      const updateData = {};
      const { university } = req.body;
      
      if (university) {
        updateData.university = university;
      }
  
      // If a file is uploaded via multer, update the profile image using its path.
      if (req.file) {
        updateData.ProfileImg = req.file.path;
      } else if (req.body.ProfileImg) {
        
        updateData.ProfileImg = req.body.ProfileImg;
      }
      
      // Use MongoDB's update method via Mongoose (findByIdAndUpdate)
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,             // Filter: update user by ID
        { $set: updateData },       // Update object with the fields to update
        { new: true }               // Return the updated document
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({ 
        message: 'User updated successfully',
        user: updatedUser  // Optionally return the updated user data
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
};

module.exports = Auth;
