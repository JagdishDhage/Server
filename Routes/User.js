const router = require('express').Router();
const passport = require('passport');
const Auth = require('../Controller/User'); // Assuming Auth is exported separately
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../Model/User');
const auth = require('../Middlewares/auth');
const multer = require('multer');

// Define Multer configuration here
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/ProfileImg/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// (Your passport configuration here)

router.post('/Register', Auth.Register);
router.post('/Login', Auth.Login);
router.get('/Logout', Auth.Logout);
router.post('/ForgotPassowrd',Auth.forgotPassword)
router.post("/ResetPassword/:token", Auth.resetPassword);
router.post('/Admin',Auth.Admin)
router.post('/Admin/reg',Auth.createLogin)
// Use the upload middleware here
router.post('/updateUser', auth, upload.single('ProfileImg'), Auth.UpdateUser);

// Protected Route: get current user details
router.get('/current', auth,Auth.getCurrentUser);

// Success and failure routes for login status
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully Logged In",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

// Google auth routes (do not change these—they work properly)
// router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     successRedirect: process.env.CLIENT_URI,
//     failureRedirect: "/login/failed",
//   })
// );

// Note: Removed duplicate logout route to avoid conflict

module.exports = router;
