const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  //只有這個必須填
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  //用google登入才會有
  googleID: {
    type: String,
  },
  //default
  date: {
    type: Date,
    default: Date.now,
  },
  //如果是local login 就不會有
  thumbnail: {
    type: String,
  },
  // local login
  email: {
    type: String,
  },
  //google登入就不用填
  password: {
    type: String,
    minLength: 8,
    maxLength: 1024,
  },
});

module.exports = mongoose.model("User", userSchema);
