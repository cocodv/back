const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const User = mongoose.model("User");
const Transaction = mongoose.model("Transaction");

router.get("/statement", async (req, res) => {
  try {
    let { user_id, start, end } = req.query;

    if (!user_id) return res.status(400).json({ error: "user_id missing" });
    if (!start || !end) return res.status(400).json({ error: "start or end date missing" });
    if (!mongoose.Types.ObjectId.isValid(user_id)) return res.status(400).json({ error: "Invalid user id" });

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const txs = await Transaction.find({
      user_id: user._id,
      created_at: { $gte: startDate, $lte: endDate },
    }).sort({ created_at: 1 });

    const fileName = `statement_${user.username}_${start}_to_${end}.pdf`;
    const filePath = path.join(__dirname, "..", "tmp", fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ---------------- HEADER ----------------
    doc.rect(0, 0, doc.page.width, 90).fill("#0f2a44");

    doc.fillColor("white")
      .fontSize(24)
      .text("Credit Union Bank", 0, 30, { align: "center" });

    doc.fontSize(12)
      .text("Official Account Statement", 0, 60, { align: "center" });

    doc.moveDown(3);
    doc.fillColor("#000");

    // ---------------- ACCOUNT CARD ----------------
    doc.roundedRect(40, 110, 520, 95, 8).fill("#f3f6fb");
    doc.fillColor("#000").fontSize(11);

    doc.text("Account Name: Miss Lena Willems", 55, 130);
    doc.text("Address:", 55, 150);
    doc.text("2 Maybury Street, Gorton M18 8GP, United Kingdom", 55, 165, {
      width: 460,
    });

    doc.text(`Statement Period: ${start} to ${end}`, 360, 130);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 360, 150);

    // ---------------- TABLE HEADER ----------------
    let tableTop = 235;
    let y = tableTop;

    doc.rect(40, y, 520, 26).fill("#1f4fd8");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(11);

    doc.text("Date", 45, y + 8, { width: 70 });
    doc.text("Description", 120, y + 8, { width: 220 });
    doc.text("Debit", 350, y + 8, { width: 60, align: "right" });
    doc.text("Credit", 420, y + 8, { width: 60, align: "right" });
    doc.text("Balance", 490, y + 8, { width: 65, align: "right" });

    y += 26;
    doc.font("Helvetica");

    let balance = 0;
    let row = 0;

    const formatMoney = (amount) =>
      "£" + Number(amount).toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // ---------------- ROWS ----------------
    txs.forEach((tx) => {
      if (y > 740) {
        doc.addPage();
        y = 60;
      }

      const bg = row % 2 === 0 ? "#ffffff" : "#f3f6fb";
      doc.rect(40, y, 520, 24).fill(bg);

      let debit = "";
      let credit = "";

      if (tx.type === "debit") {
        balance -= tx.amount;
        debit = formatMoney(tx.amount);
      }

      if (tx.type === "credit") {
        balance += tx.amount;
        credit = formatMoney(tx.amount);
      }

      doc.fillColor("#000");

      doc.text(new Date(tx.created_at).toLocaleDateString(), 45, y + 7, { width: 70 });

      doc.text(tx.description || tx.type || "Transaction", 120, y + 7, {
        width: 220,
        lineBreak: true,
      });

      doc.text(debit, 350, y + 7, { width: 60, align: "right" });
      doc.text(credit, 420, y + 7, { width: 60, align: "right" });
      doc.text(formatMoney(balance), 490, y + 7, {
        width: 65,
        align: "right",
      });

      y += 24;
      row++;
    });

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, fileName, () => fs.unlinkSync(filePath));
    });

  } catch (err) {
    console.error("STATEMENT ERROR:", err);
    res.status(500).json({ error: "Failed to generate statement" });
  }
});

module.exports = router;




// const express = require("express");
// const router = express.Router();
// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");
// const mongoose = require("mongoose");

// // Use existing mongoose connection
// const User = mongoose.model("User");
// const Transaction = mongoose.model("Transaction");

// router.get("/statement", async (req, res) => {
//   try {
//     let { user_id, start, end } = req.query;

//     console.log("STATEMENT REQUEST:", { user_id, start, end });

//     if (!user_id) {
//       return res.status(400).json({ error: "user_id missing" });
//     }

//     if (!start || !end) {
//       return res.status(400).json({ error: "start or end date missing" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(user_id)) {
//       return res.status(400).json({ error: "Invalid user id" });
//     }

//     // Dates
//     const startDate = new Date(start);
//     const endDate = new Date(end);
//     endDate.setHours(23, 59, 59, 999); // include today fully

//     const user = await User.findById(user_id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const txs = await Transaction.find({
//       user_id: user._id,
//       created_at: { $gte: startDate, $lte: endDate },
//     }).sort({ created_at: 1 });

//     // ---------------- PDF SETUP ----------------
//     const fileName = `statement_${user.username}_${start}_to_${end}.pdf`;
//     const filePath = path.join(__dirname, "..", "tmp", fileName);

//     if (!fs.existsSync(path.dirname(filePath))) {
//       fs.mkdirSync(path.dirname(filePath), { recursive: true });
//     }

//     const doc = new PDFDocument({ margin: 40, size: "A4" });
//     const stream = fs.createWriteStream(filePath);
//     doc.pipe(stream);

//     // -------- HEADER --------
//     doc.fillColor("#1f4fd8");
//     doc.fontSize(22).text("Credit Union Bank Statement", { align: "center" });
//     doc.moveDown();

//     // Account block (BLUE)
//     doc.fontSize(14).text("Miss Lena Willems");
//     doc.fontSize(11).text("2 Maybury Street");
//     doc.text("Gorton M18 8GP");
//     doc.text("United Kingdom");
//     doc.moveDown();

//     doc.fillColor("black");
//     doc.fontSize(11).text(`Statement Period: ${start} to ${end}`);
//     doc.text(`Generated: ${new Date().toLocaleDateString()}`);
//     doc.moveDown(2);

//     // -------- TABLE HEADER --------
//     const headerY = doc.y;
//     doc.font("Helvetica-Bold");

//     doc.text("Date", 40, headerY, { width: 90 });
//     doc.text("Description", 130, headerY, { width: 220 });
//     doc.text("Debit", 360, headerY, { width: 80, align: "right" });
//     doc.text("Credit", 450, headerY, { width: 80, align: "right" });

//     doc.moveDown();
//     doc.font("Helvetica");

//     let y = doc.y;

//     if (!txs.length) {
//       doc.text("No transactions for this period.", 40, y);
//     }

//     // -------- ROWS --------
//     txs.forEach((tx) => {
//       if (y > 750) {
//         doc.addPage();
//         y = 40;
//       }

//       const date = new Date(tx.created_at).toLocaleDateString();
//       const desc = tx.description || tx.type || "Transaction";

//       let debit = "";
//       let credit = "";

//       if (tx.type === "debit") {
//         debit = `£${Number(tx.amount).toFixed(2)}`;
//       }

//       if (tx.type === "credit") {
//         credit = `£${Number(tx.amount).toFixed(2)}`;
//       }

//       doc.text(date, 40, y, { width: 90 });
//       doc.text(desc, 130, y, { width: 220 });
//       doc.text(debit, 360, y, { width: 80, align: "right" });
//       doc.text(credit, 450, y, { width: 80, align: "right" });

//       y += 22;
//     });

//     doc.end();

//     stream.on("finish", () => {
//       res.download(filePath, fileName, (err) => {
//         if (err) console.error(err);
//         fs.unlinkSync(filePath);
//       });
//     });

//   } catch (err) {
//     console.error("STATEMENT ERROR:", err);
//     res.status(500).json({ error: "Failed to generate statement" });
//   }
// });

// module.exports = router;



