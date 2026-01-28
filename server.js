require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connect = require("./config/db");

// Connect to MongoDB
connect();

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: "http://localhost:3000", // React frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // allowed headers
  credentials: true
}));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes/user"));
app.use("/admin", require("./routes/admin"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));
