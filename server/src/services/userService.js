import { UserRepository } from "../repositories/userRepository.js";
import jwt from "jsonwebtoken";

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

  async createUser(userData) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    return await this.userRepository.create(userData);
  }

  async createOrUpdateUserFrom42(profile) {
    // Try multiple possible structures
    const profileData = profile._json || profile;
    const fortyTwoId = (profileData.id || profile.id).toString();

    let user = await this.userRepository.findByFortyTwoId(fortyTwoId);
    const userData = {
      firstName: profileData.first_name || `User`,
      lastName: profileData.last_name || fortyTwoId,
      email: profileData.email || `user${fortyTwoId}@42.fr`,
      username: profileData.login || `user${fortyTwoId}`,
      avatar: profileData.image?.link,
      fortyTwoId: fortyTwoId,
    };

    if (user) {
      // Update existing user
      user = await this.userRepository.update(user.id, userData);
    } else {
      // Create new user
      user = await this.userRepository.create(userData);
    }

    return user;
  }

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
      { expiresIn: "30d" } // Refresh tokens last longer
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
}
