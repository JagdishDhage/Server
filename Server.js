require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const router = require("./Routes/User");
const noteRoutes = require("./Routes/Books");
const dept = require("./Routes/Department");
const university = require("./Routes/University");
const news = require("./Routes/News");

require("./Middlewares/Passport");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URI || "http://localhost:5173",
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "jagdish",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/user", router);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", noteRoutes);
app.use("/dept", dept);
app.use("/uni", university);
app.use("/newsLetter", news);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log("Database connection error:", err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
