import express from "express";
import { AchievementController } from "../controllers/achievementController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = express.Router();
const achievementController = new AchievementController();

// Protected routes - Require authentication
router.use(authenticateJWT);

// Get user achievements
router.get("/user/:userId", achievementController.getUserAchievements);

// Check and unlock achievements for a user
router.post("/user/:userId/check", achievementController.checkAchievements);

export default router;
