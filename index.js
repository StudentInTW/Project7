const dotenv = require("dotenv");
//put environment vairable
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes");
const profileRoutes = require("./routes/profile.routes");
require("./config/passport");
const session = require("express-session");
const passport = require("passport");

//告訴使用者不合格 登入資訊
const flash = require("connect-flash");

// 連結MongoDB
mongoose
  .connect("mongodb://127.0.0.1/GoogleDB")
  .then(() => {
    console.log("Connecting to mongodb...");
  })
  .catch((e) => {
    console.log(e);
  });

// 設定Middlewares以及排版引擎
//若有使用app.set(“view engine”, “ejs”)，則使用res.render()時，就不需要指定文件類別。例如， res.render(“index.ejs”)可以改成res.render(“index”)。

app.set("view engine", "ejs");
//express built-in 的function 放在middleware內部
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//在Passport當中，serialization與deserialization的功能名稱叫做serializeUser與deserializeUser。我們實作這兩個功能之前，需要先使用express-session這個套件的功能，幫session做簽名等功能。
//有關serialization 幫done做事
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
//讓passport運行認證功能
app.use(passport.initialize());
//設定好Session後可以給passport用
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  //res.local的值可以直接拿去ejs使用
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// 設定routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
  return res.render("index", { user: req.user });
});

app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
