import { UserService } from "../services/userService.js";

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  // Get all users
  getUsers = async (req, res) => {
    try {
      const users = await this.userService.getAllUsers();
      res.json({
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch users",
        error: error.message,
      });
    }
  };

  // Get user by ID
  getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(parseInt(id));

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch user",
        error: error.message,
      });
    }
  };

  getCurrentUser = async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          message: "User not authenticated",
        });
      }

      // Remove sensitive information before sending
      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch current user",
        error: error.message,
      });
    }
  };
}
