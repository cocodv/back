require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const username = "lenamiss";
    const password = "lenapass243";

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashed,
      is_admin: false,
      balance: 5000
    });

    console.log("✅ User created:");
    console.log("Username:", username);
    console.log("Password:", password);

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
