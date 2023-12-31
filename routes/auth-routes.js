const router = require("express").Router();
const passport = require("passport");
const User = require("../modles/user-model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.get(
  "/google",
  //用google認證，coming from passport 套件
  passport.authenticate("google", {
    scope: ["profile", "email"],
    //prompt可以讓使用者選擇哪個gmail帳號登入
    prompt: "select_account",
  })
);

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 8) {
    //如果有人用postman post 這裡的就會有用 ejs就無法限制
    req.flash("error_msg", "密碼長度過短，至少需要8個數字或英文字。");
    return res.redirect("/auth/signup");
  }

  // 確認信箱是否被註冊過
  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash(
      "error_msg",
      "信箱已經被註冊。請使用另一個信箱，或者嘗試使用此信箱登入系統"
    );
    return res.redirect("/auth/signup");
  }
  //加密!!
  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  req.flash("success_msg", "恭喜註冊成功! 現在可以登入系統了!");
  return res.redirect("/auth/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    //會自動套用到index.js的  res.locals.error = req.flash("error");
    failureFlash: "登入失敗。帳號或密碼不正確。",
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

//加上passport.authenticate("google")要確定只有通過google authenticate才能使用的route
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log("進入redirect區域");
  return res.redirect("/profile");
});

module.exports = router;
