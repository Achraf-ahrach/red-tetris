import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import socketRoutes from "./socketRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/socket", socketRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

export default router;
