import { UserRepository } from "../repositories/userRepository.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id) {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email) {
    return await this.userRepository.findByEmail(email);
  }

  async getUserByUsername(username) {
    return await this.userRepository.findByUsername(username);
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();
    // Remove passwords from all users
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async createUser(userData) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    return await this.userRepository.create(userData);
  }

  // 42 OAuth user creation method removed - using email/password registration only

  generateJWT(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id,
        type: "refresh",
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
  }

  verifyJWT(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  verifyRefreshToken(token) {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  }

  async registerUser(userData) {
    const { email, password, username, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Check if username is taken
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new Error("Username is already taken");
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await this.userRepository.create({
      email,
      username,
      firstName,
      lastName,
      password: hashedPassword,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async loginUser(email, password) {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user has a password
    if (!user.password) {
      throw new Error("Please login using 42 authentication");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Hash password for updates
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password - updated signature to accept userId and plain password
  async verifyPassword(userId, plainPassword) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.password) {
      return false;
    }
    return await bcrypt.compare(plainPassword, user.password);
  }

  // Update user password
  async updatePassword(userId, newPassword) {
    const hashedPassword = await this.hashPassword(newPassword);
    return await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }

  async updateUser(id, userData) {
    return await this.userRepository.update(id, userData);
  }

  async getLeaderboard(limit = 50) {
    return await this.userRepository.getLeaderboard(limit);
  }

  async addGameHistory(userId, payload) {
    return this.userRepository.addGameHistory({ userId, ...payload });
  }

  async getGameHistory(userId, options) {
    return this.userRepository.getGameHistoryByUser(userId, options);
  }

  async updateUserStats(userId, stats) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData = {};
    if (stats.totalGames !== undefined)
      updateData.totalGames = stats.totalGames;
    if (stats.totalWins !== undefined) updateData.totalWins = stats.totalWins;
    if (stats.totalLosses !== undefined)
      updateData.totalLosses = stats.totalLosses;
    if (stats.highScore !== undefined) updateData.highScore = stats.highScore;
    if (stats.totalLines !== undefined)
      updateData.totalLines = stats.totalLines;
    if (stats.currentStreak !== undefined)
      updateData.currentStreak = stats.currentStreak;
    if (stats.longestStreak !== undefined)
      updateData.longestStreak = stats.longestStreak;
    if (stats.totalPlayTime !== undefined)
      updateData.totalPlayTime = stats.totalPlayTime;
    if (stats.level !== undefined) updateData.level = stats.level;
    if (stats.experience !== undefined)
      updateData.experience = stats.experience;

    return await this.userRepository.update(userId, updateData);
  }

  async getUserStats(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      totalGames: user.totalGames || 0,
      totalWins: user.totalWins || 0,
      totalLosses: user.totalLosses || 0,
      highScore: user.highScore || 0,
      totalLines: user.totalLines || 0,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalPlayTime: user.totalPlayTime || 0,
      level: user.level || 1,
      experience: user.experience || 0,
      winRate:
        user.totalGames > 0
          ? ((user.totalWins / user.totalGames) * 100).toFixed(1)
          : 0,
    };
  }

  async searchUsersByUsername(searchTerm) {
    const allUsers = await this.userRepository.findAll();
    const filtered = allUsers.filter(
      (user) =>
        user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Remove passwords from results
    return filtered.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}
