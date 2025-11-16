import express from "express";
import { UserController } from "../controllers/userController.js";
import { authenticateJWT } from "../middlewares/auth.js";
import { uploadAvatar, handleUploadError } from "../middlewares/upload.js";

const router = express.Router();
const userController = new UserController();

router.use(authenticateJWT);

router.get("/", userController.getUsers);
router.get("/leaderboard", userController.getLeaderboard);
router.get("/me", userController.getCurrentUser);
router.get("/me/profile", userController.getCurrentUserProfile);
router.put("/me/profile", userController.updateCurrentUserProfile);
router.put("/me/password", userController.updateCurrentUserPassword);

// Test endpoint to verify route is accessible
router.get("/me/avatar/test", (req, res) => {
  res.json({ success: true, message: "Avatar endpoint is accessible" });
});

router.post(
  "/me/avatar",
  uploadAvatar.single("avatar"),
  handleUploadError,
  userController.uploadCurrentUserAvatar
);
router.get("/:id", userController.getUserById);
router.get("/:id/stats", userController.getUserStats);
router.put("/:id/stats", userController.updateUserStats);
router.post("/:id/complete-game", userController.completeGame);

// Game history routes
router.get("/:id/history", userController.getUserGameHistory);
router.post("/:id/history", userController.addUserGameHistory);

export default router;
