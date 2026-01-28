const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  is_admin: { type: Boolean, default: false },
  balance: { type: Number, default: 0 }
});

module.exports = mongoose.model("User", UserSchema);
