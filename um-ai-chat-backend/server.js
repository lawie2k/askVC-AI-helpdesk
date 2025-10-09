const express = require("express");
const cors = require("cors");
const path = require("path");


const authRoutes = require("./auth");
const endpoints = require("./endpoints");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

// Mount route modules
app.use("/auth", authRoutes);
app.use("/", endpoints);


app.get("/auth/_debug", (req, res) => {
  try {
    const stack = (authRoutes && authRoutes.stack) || [];
    return res.json({ ok: true, routes: stack.map(l => l.route && l.route.path).filter(Boolean) });
  } catch (e) {
    return res.json({ ok: false, error: String(e) });
  }
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 UM AI Helpdesk Backend running on port ${PORT}`);
  console.log(`🤖 AI Service: Initialized`);
});

module.exports = app;
