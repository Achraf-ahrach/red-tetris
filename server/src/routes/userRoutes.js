import express from "express";
import { UserController } from "../controllers/userController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = express.Router();
const userController = new UserController();

router.use(authenticateJWT);

router.get("/", userController.getUsers);
router.get("/leaderboard", userController.getLeaderboard);
router.get("/me", userController.getCurrentUser);
router.get("/me/profile", userController.getCurrentUserProfile);
router.put("/me/profile", userController.updateCurrentUserProfile);
router.put("/me/password", userController.updateCurrentUserPassword);
router.get("/:id", userController.getUserById);
router.get("/:id/stats", userController.getUserStats);
router.put("/:id/stats", userController.updateUserStats);
router.post("/:id/complete-game", userController.completeGame);

// Game history routes
router.get("/:id/history", userController.getUserGameHistory);
router.post("/:id/history", userController.addUserGameHistory);

export default router;
