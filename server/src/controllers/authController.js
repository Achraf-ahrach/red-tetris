import { UserService } from "../services/userService.js";

export class AuthController {
  constructor() {
    this.userService = new UserService();
  }

  // 42 OAuth methods removed - using email/password authentication only

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
          message: "Logout failed",
        });
      }
      res.json({
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
          message: "Refresh token required",
        });
      }

      // Verify refresh token
      const decoded = this.userService.verifyRefreshToken(refreshToken);

      if (decoded.type !== "refresh") {
        return res.status(401).json({
          message: "Invalid refresh token",
        });
      }

      // Get user and generate new tokens
      const user = await this.userService.getUserById(decoded.id);
      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      const newAccessToken = this.userService.generateJWT(user);
      const newRefreshToken = this.userService.generateRefreshToken(user);

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      res.status(401).json({
        message: "Invalid refresh token",
      });
    }
  };

  // Register with email and password
  register = async (req, res) => {
    try {
      const { email, password, username, firstName, lastName } = req.body;

      // Validate required fields
      if (!email || !password || !username) {
        return res.status(400).json({
          success: false,
          message: "Email, password, and username are required",
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      const user = await this.userService.registerUser({
        firstName,
        lastName,
        username,
        password,
        email,
      });

      console.log({ user });
      res.status(201).json({
        message: "User registered successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Login with email and password
  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      // Login user
      const user = await this.userService.loginUser(email, password);

      // Generate tokens
      const accessToken = this.userService.generateJWT(user);
      const refreshToken = this.userService.generateRefreshToken(user);

      res.json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  };
}
