import express from "express";
import { UserController } from "../controllers/userController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = express.Router();
const userController = new UserController();

router.get("/", authenticateJWT, userController.getUsers);
router.get("/leaderboard", userController.getLeaderboard); 
router.get("/me", authenticateJWT, userController.getCurrentUser);
router.get(
  "/me/profile",
  authenticateJWT,
  userController.getCurrentUserProfile
);
router.get("/:id", authenticateJWT, userController.getUserById);
router.get("/:id/stats", authenticateJWT, userController.getUserStats);
router.put("/:id/stats", authenticateJWT, userController.updateUserStats);
router.post("/:id/complete-game", authenticateJWT, userController.completeGame);

// Game history routes
router.get("/:id/history", authenticateJWT, userController.getUserGameHistory);
router.post("/:id/history", authenticateJWT, userController.addUserGameHistory);

export default router;
