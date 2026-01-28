const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Tx = require("../models/Transaction");

router.use(auth);

router.get("/pending", async (req, res) => {
  if (!req.user.is_admin) return res.sendStatus(403);
  const txs = await Tx.find({ status: "pending" });
  res.json(txs.map(t => ({ ...t.toObject(), id: t._id })));
});

router.post("/credit", async (req, res) => {
  if (!req.user.is_admin) return res.sendStatus(403);

  const { username, amount } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.json({ detail: "User not found" });

  user.balance += amount;
  await user.save();

  await Tx.create({
    user_id: user._id,
    type: "credit",
    amount,
    status: "approved",
    description: "Incoming Credit from Daniel Mchughes"
  });

  res.json({ detail: "Account credited" });
});

router.post("/approve/:id", async (req, res) => {
  if (!req.user.is_admin) return res.sendStatus(403);

  const tx = await Tx.findById(req.params.id);
  if (!tx) return res.sendStatus(404);

  const user = await User.findById(tx.user_id);
  user.balance -= tx.amount;
  await user.save();

  tx.status = "approved";
  await tx.save();

  res.json({ detail: "Approved" });
});

module.exports = router;
