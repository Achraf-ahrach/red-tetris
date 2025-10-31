import express from "express";
import { getGameStats } from "../config/socket.js";

const router = express.Router();

/**
 * GET /api/game/stats
 * Get current game server statistics
 */
router.get("/stats", (req, res) => {
  try {
    const stats = getGameStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve game stats",
      error: error.message,
    });
  }
});

/**
 * GET /api/game/health
 * Health check for game server
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Game server is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
