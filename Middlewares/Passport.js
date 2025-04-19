// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const passport = require("passport");

// passport.use(
// 	new GoogleStrategy(
// 		{
			
// 			clientSecret: process.env.GOOGLE_KEY,
// 			clientID: process.env.CLIENT_ID,
// 			callbackURL: "/user/google/callback",
// 			scope: ["profile", "email"],
// 		},
// 		function (accessToken, refreshToken, profile, callback) {
// 			callback(null, profile);
// 		}
// 	)
// );

// passport.serializeUser((user, done) => {
// 	done(null, user);
// });

// passport.deserializeUser((user, done) => {
// 	done(null, user);
// });
