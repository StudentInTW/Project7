const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../modles/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

//在Google Strategy內部的第二個參數的function所使用的第四個參數done被我們執行時，
//Passport會透過express-session套件去自動執行passport.serializeUser()。 serializeUser()參數為user與done。
//user會被自動帶入Google Strategy的done的第二個參數。 passport.serializeUser()也會自動帶入以下的兩個功能(當內部的done()被執行時)：

passport.serializeUser((user, done) => {
  console.log("Serialize使用者。。。");
  //內部的done()執行時，將參數的值放入session內部，並且在用戶端設置cookie。
  done(null, user._id); // 將mongoDB的id，存在session
  // 並且將id簽名後，以Cookie的形式給使用者。。。
});
//After serializing user
passport.deserializeUser(async (_id, done) => {
  console.log(
    "Deserialize使用者。。。使用serializeUser儲存的id，去找到資料庫內的資料"
  );
  let foundUser = await User.findOne({ _id });
  done(null, foundUser); // 將req.user這個屬性設定為foundUser
});

//google strategy 語法 https://www.passportjs.org/packages/passport-google-oauth20/
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    //我們可以在此function內部判斷，若此用戶為第一次登入系統，則將從Google取得的用戶資料存入我們系統的資料庫內。
    async (accessToken, refreshToken, profile, done) => {
      console.log("進入Google Strategy的區域");
      //去 mongodb找有沒有這個人的資料

      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("使用者已經註冊過了。無須存入資料庫內。");
        done(null, foundUser);
      } else {
        console.log("偵測到新用戶。須將資料存入資料庫內");
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        let savedUser = await newUser.save();
        console.log("成功創建新用戶。");
        //第一個參數是passport規定的
        //在此function的第四個參數done是一個function。我們可以將使用者資訊放入done的第二個參數內，並且執行done()。
        //執行時會到serialize user
        done(null, savedUser);
      }
    }
  )
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    let foundUser = await User.findOne({ email: username });
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        //if it works done will take foundUser to the function serializeUser
        done(null, foundUser);
      } else {
        //false means authentication doesn't work
        done(null, false);
      }
    } else {
      done(null, false);
    }
  })
);
