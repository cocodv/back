const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ detail: "Invalid login" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ detail: "Invalid login" });

  const token = jwt.sign(
    { id: user._id, is_admin: user.is_admin, username: user.username },
    process.env.JWT_SECRET
  );

  res.json({ access_token: token });
});

module.exports = router;

