const express = require("express");

const router = express.Router();

// ============================================================================
// BASIC ENDPOINTS - Health check and root endpoint
// ============================================================================

// Root endpoint - Server health check
router.get("/", (req, res) => {
  res.send("UM AI Helpdesk Backend is running 🚀");
});

// ============================================================================
// ROUTE IMPORTS - Import all route modules
// ============================================================================

// AI Chat endpoint
const chatRoutes = require("./chat");
router.use("/", chatRoutes);

// API Routes
const departmentsRoutes = require("./api/departments");
const roomsRoutes = require("./api/rooms");
const officesRoutes = require("./api/offices");
const buildingsRoutes = require("./api/buildings");
const professorsRoutes = require("./api/professors");
const rulesRoutes = require("./api/rules");
const settingsRoutes = require("./api/settings");
const logsRoutes = require("./api/logs");

// Mount API routes
router.use("/api/departments", departmentsRoutes);
router.use("/api/rooms", roomsRoutes);
router.use("/api/offices", officesRoutes);
router.use("/api/buildings", buildingsRoutes);
router.use("/api/professors", professorsRoutes);
router.use("/api/rules", rulesRoutes);
router.use("/api/settings", settingsRoutes);
router.use("/api/logs", logsRoutes);

// ============================================================================
// EXPORT ROUTER - Make endpoints available to server.js
// ============================================================================

module.exports = router;
