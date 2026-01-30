require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// --------------------
// Connect to MongoDB
// --------------------
connectDB(); // connect once here

// --------------------
// Create Express App
// --------------------
const app = express();

// --------------------
// Middleware
// --------------------
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://front-7xrl.onrender.com",
      "https://manchestercreditunion.online",
      "https://www.manchestercreditunion.online"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
  })
);

// --------------------
// Routes
// --------------------
app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes/user"));
app.use("/admin", require("./routes/admin"));
app.use("/", require("./routes/statement")); // <- statement route

// --------------------
// 404 handler
// --------------------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --------------------
// Global error handler
// --------------------
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
