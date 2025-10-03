import express from "express";
import passport from "../config/passport.js";
import { AuthController } from "../controllers/authController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = express.Router();
const authController = new AuthController();

// 42 OAuth routes
router.get("/42", passport.authenticate("42"));
router.get(
  "/42/callback",
  passport.authenticate("42", {
    failureRedirect: `${process.env.CLIENT_URL}/auth/error`,
  }),
  authController.fortyTwoCallback
);

// User routes
router.get("/me", authenticateJWT, authController.getCurrentUser);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
