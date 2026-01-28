const mongoose = require("mongoose");

const TxSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["credit", "debit"], required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "approved", "completed", "failed"],  // <-- added "approved"
    default: "pending" 
  },
  description: { type: String, default: "Transaction" },
  
  // Bank transfer fields
  sort_code: String,             // replaces routing number
  account_number: String,
  account_holder_name: String,   // replaces check field
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TxSchema);
