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
const officesRoutes = require("./api/offices");
const buildingsRoutes = require("./api/buildings");
const roomsRoutes = require("./api/rooms");
const professorsRoutes = require("./api/professors");
const rulesRoutes = require("./api/rules");
const settingsRoutes = require("./api/settings");
const visionMissionRoutes = require("./api/visionMission");
const campusInfoRoutes = require("./api/campusInfo");
const nonTeachingStaffRoutes = require("./api/nonTeachingStaff");
const announcementsRoutes = require("./api/announcements");
const officersRoutes = require("./api/officers");
const logsRoutes = require("./api/logs");
const chatHistoryRoutes = require("./api/chatHistory");
const statsRoutes = require("./api/stats");
const uploadRoutes = require("./api/upload");
const feedbackRoutes = require("./api/feedback");

// Mount API routes
router.use("/api/departments", departmentsRoutes);
router.use("/api/offices", officesRoutes);
router.use("/api/buildings", buildingsRoutes);
router.use("/api/rooms", roomsRoutes);
router.use("/api/professors", professorsRoutes);
router.use("/api/rules", rulesRoutes);
router.use("/api/vision-mission", visionMissionRoutes);
router.use("/api/campus-info", campusInfoRoutes);
router.use("/api/non-teaching-staff", nonTeachingStaffRoutes);
router.use("/api/announcements", announcementsRoutes);
router.use("/api/officers", officersRoutes);
router.use("/api/settings", settingsRoutes);
router.use("/api/logs", logsRoutes);
router.use("/api/chat-history", chatHistoryRoutes);
router.use("/api/stats", statsRoutes);
router.use("/api/upload", uploadRoutes);
router.use("/api/feedback", feedbackRoutes);

// ============================================================================
// EXPORT ROUTER - Make endpoints available to server.js
// ============================================================================

module.exports = router;
