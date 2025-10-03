import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

export default router;
