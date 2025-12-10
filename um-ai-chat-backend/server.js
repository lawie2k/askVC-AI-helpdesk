const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "UM AI Helpdesk Backend is running" });
});

// Load routes with error handling
let authRoutes, endpoints;
try {
  authRoutes = require("./routes/auth");
  endpoints = require("./routes/endpoints");
  app.use("/auth", authRoutes);
  app.use("/", endpoints);
  console.log("✅ Routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading routes:", error);
  app.use("/auth", (req, res) => res.status(500).json({ error: "Routes not loaded" }));
  app.use("/", (req, res) => res.status(500).json({ error: "Routes not loaded" }));
}


app.get("/auth/_debug", (req, res) => {
  try {
    const stack = (authRoutes && authRoutes.stack) || [];
    return res.json({ ok: true, routes: stack.map(l => l.route && l.route.path).filter(Boolean) });
  } catch (e) {
    return res.json({ ok: false, error: String(e) });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 UM AI Helpdesk Backend running on port ${PORT}`);
  console.log(`🤖 AI Service: Initialized`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? 'Set' : 'NOT SET'}`);
  console.log(`🛠️ Build marker: rv2-image-debug`);
});

module.exports = app;
