const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const endpoints = require("./routes/endpoints");

const app = express();
app.use(cors());
app.use(express.json());


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
