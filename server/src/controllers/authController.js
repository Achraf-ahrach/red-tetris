import { UserService } from "../services/userService.js";

export class AuthController {
  constructor() {
    this.userService = new UserService();
  }

  // 42 OAuth callback
  fortyTwoCallback = async (req, res) => {
    try {
      const accessToken = this.userService.generateJWT(req.user);
      const refreshToken = this.userService.generateRefreshToken(req.user);
      res.json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(500).json({
        message: "Authentication failed",
        error: error.message,
      });
    }
  };

  // Get current user
  getCurrentUser = async (req, res) => {
    try {
      res.json({
        user: req.user,
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };

  // Logout
  logout = (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Logout failed",
        });
      }
      res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  };

  // Refresh access token
  refreshToken = async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token required",
        });
      }

      // Verify refresh token
      const decoded = this.userService.verifyRefreshToken(refreshToken);

      if (decoded.type !== "refresh") {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Get user and generate new tokens
      const user = await this.userService.getUserById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      const newAccessToken = this.userService.generateJWT(user);
      const newRefreshToken = this.userService.generateRefreshToken(user);

      res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  };
}
