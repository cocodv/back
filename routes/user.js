// const router = require("express").Router();
// const auth = require("../middleware/auth");
// const User = require("../models/User");
// const Tx = require("../models/Transaction");

// router.get("/me", auth, async (req, res) => {
//   res.json(req.user);
// });

// router.get("/balance", auth, async (req, res) => {
//   const user = await User.findById(req.user.id);
//   const txs = await Tx.find({ user_id: user._id });

//   const credits = txs.filter(t => t.type === "credit").reduce((a,b)=>a+b.amount,0);
//   const debits = txs.filter(t => t.type === "debit").reduce((a,b)=>a+b.amount,0);

//   res.json({
//     balance: user.balance,
//     total_credits: credits,
//     total_debits: debits
//   });
// });

// router.get("/transactions", auth, async (req, res) => {
//   const txs = await Tx.find({ user_id: req.user.id }).sort({ created_at: -1 });
//   res.json(txs.map(t => ({ ...t.toObject(), id: t._id })));
// });

// router.post("/withdraw", auth, async (req, res) => {
//   const { amount } = req.body;
//   const user = await User.findById(req.user.id);

//   if (user.balance < amount) {
//     return res.json({ detail: "Insufficient funds" });
//   }

//   await Tx.create({
//     user_id: user._id,
//     type: "debit",
//     amount,
//     status: "pending",
//     description: "Withdrawal request"
//   });

//   res.json({ detail: "Withdrawal submitted" });
// });

// module.exports = router;

const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Tx = require("../models/Transaction");

router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

router.get("/balance", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const txs = await Tx.find({ user_id: user._id });

  const credits = txs.filter(t => t.type === "credit").reduce((a,b)=>a+b.amount,0);
  const debits = txs.filter(t => t.type === "debit").reduce((a,b)=>a+b.amount,0);

  res.json({
    balance: user.balance,
    total_credits: credits,
    total_debits: debits
  });
});

router.get("/transactions", auth, async (req, res) => {
  const txs = await Tx.find({ user_id: req.user.id }).sort({ created_at: -1 });
  res.json(txs.map(t => ({ ...t.toObject(), id: t._id })));
});







router.post("/withdraw", auth, async (req, res) => {
  try {
    const { amount, sort_code, account_number, account_holder_name, description } = req.body;
    const user = await User.findById(req.user.id);

    if (!amount || !sort_code || !account_number || !account_holder_name) {
      return res.status(400).json({ detail: "Missing required fields" });
    }

    if (user.balance < amount) {
      return res.json({ detail: "Insufficient funds" });
    }

    // Create transaction
    await Tx.create({
      user_id: user._id,
      type: "debit",
      amount,
      status: "pending", // pending until approved
      description: description || "Withdrawal",
      sort_code,
      account_number,
      account_holder_name
    });

    res.json({ detail: "Withdrawal submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

module.exports = router;
