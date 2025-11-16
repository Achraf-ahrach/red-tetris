import { UserService } from "../../src/services/userService.js";
import { MockUserRepository } from "../mocks/MockUserRepository.js";
import jwt from "jsonwebtoken";

// Mock environment variables
process.env.JWT_SECRET = "test-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_EXPIRES_IN = "1h";

describe("UserService", () => {
  let userService;
  let mockRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    userService = new UserService();
    // Replace the real repository with our mock
    userService.userRepository = mockRepository;
  });

  afterEach(() => {
    mockRepository.clear();
  });

  describe("registerUser", () => {
    const validUserData = {
      email: "test@example.com",
      password: "password123",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
    };

    test("should register a new user successfully", async () => {
      const result = await userService.registerUser(validUserData);

      expect(result.email).toBe(validUserData.email);
      expect(result.username).toBe(validUserData.username);
      expect(result.firstName).toBe(validUserData.firstName);
      expect(result.lastName).toBe(validUserData.lastName);
      expect(result.password).toBeUndefined();
      expect(result.id).toBeDefined();
    });

    test("should hash the password", async () => {
      await userService.registerUser(validUserData);

      const userInDb = mockRepository.getUsers()[0];
      expect(userInDb.password).not.toBe(validUserData.password);
      expect(userInDb.password).toMatch(/^\$2[aby]\$\d+\$/);
    });

    test("should throw error if email already exists", async () => {
      await userService.registerUser(validUserData);

      await expect(
        userService.registerUser({
          ...validUserData,
          username: "differentuser",
        })
      ).rejects.toThrow("User already exists with this email");
    });

    test("should throw error if username already exists", async () => {
      await userService.registerUser(validUserData);

      await expect(
        userService.registerUser({
          ...validUserData,
          email: "different@example.com",
        })
      ).rejects.toThrow("Username is already taken");
    });
  });

  describe("loginUser", () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
    };

    beforeEach(async () => {
      await userService.registerUser(userData);
    });

    test("should login with correct credentials", async () => {
      const result = await userService.loginUser(
        userData.email,
        userData.password
      );

      expect(result.email).toBe(userData.email);
      expect(result.username).toBe(userData.username);
      expect(result.password).toBeUndefined();
    });

    test("should throw error with wrong email", async () => {
      await expect(
        userService.loginUser("wrong@example.com", userData.password)
      ).rejects.toThrow("Invalid email or password");
    });

    test("should throw error with wrong password", async () => {
      await expect(
        userService.loginUser(userData.email, "wrongpassword")
      ).rejects.toThrow("Invalid email or password");
    });

    test("should throw error for OAuth-only user", async () => {
      const oauthUser = {
        email: "oauth@example.com",
        username: "oauthuser",
        fortyTwoId: "12345",
      };
      await mockRepository.create(oauthUser);

      await expect(
        userService.loginUser(oauthUser.email, "somepassword")
      ).rejects.toThrow("Please login using 42 authentication");
    });
  });

  describe("JWT Token Methods", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      username: "testuser",
    };

    test("should generate valid JWT token", () => {
      const token = userService.generateJWT(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.username).toBe(mockUser.username);
    });

    test("should generate valid refresh token", () => {
      const refreshToken = userService.generateRefreshToken(mockUser);

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe("string");

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.type).toBe("refresh");
    });

    test("should verify JWT token", () => {
      const token = userService.generateJWT(mockUser);
      const decoded = userService.verifyJWT(token);

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });

    test("should verify refresh token", () => {
      const refreshToken = userService.generateRefreshToken(mockUser);
      const decoded = userService.verifyRefreshToken(refreshToken);

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.type).toBe("refresh");
    });

    test("should throw error for invalid token", () => {
      expect(() => {
        userService.verifyJWT("invalid-token");
      }).toThrow();
    });
  });

  // OAuth tests removed - createOrUpdateUserFrom42 method no longer exists

  describe("getAllUsers", () => {
    test("should return all users without passwords", async () => {
      await userService.registerUser({
        email: "user1@example.com",
        password: "password1",
        username: "user1",
      });

      await userService.registerUser({
        email: "user2@example.com",
        password: "password2",
        username: "user2",
      });

      const users = await userService.getAllUsers();

      expect(users).toHaveLength(2);
      expect(users[0].password).toBeUndefined();
      expect(users[1].password).toBeUndefined();
      expect(users[0].email).toBe("user1@example.com");
      expect(users[1].email).toBe("user2@example.com");
    });
  });

  describe("getUserById", () => {
    test("should return user by id", async () => {
      const user = await userService.registerUser({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });

      const result = await userService.getUserById(user.id);
      expect(result.email).toBe("test@example.com");
    });

    test("should return null for non-existent user", async () => {
      const result = await userService.getUserById(999);
      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    test("should return user by email", async () => {
      await userService.registerUser({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });

      const result = await userService.getUserByEmail("test@example.com");
      expect(result.email).toBe("test@example.com");
    });

    test("should return null for non-existent email", async () => {
      const result = await userService.getUserByEmail(
        "nonexistent@example.com"
      );
      expect(result).toBeNull();
    });
  });

  describe("getUserByUsername", () => {
    test("should return user by username", async () => {
      await userService.registerUser({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });

      const result = await userService.getUserByUsername("testuser");
      expect(result.username).toBe("testuser");
    });

    test("should return null for non-existent username", async () => {
      const result = await userService.getUserByUsername("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    test("should create a new user", async () => {
      const userData = {
        email: "new@example.com",
        password: "hashedpassword",
        username: "newuser",
      };

      const result = await userService.createUser(userData);
      expect(result.email).toBe(userData.email);
    });

    test("should throw error if user with email exists", async () => {
      const userData = {
        email: "existing@example.com",
        password: "password",
        username: "user1",
      };

      await userService.createUser(userData);

      await expect(
        userService.createUser({
          ...userData,
          username: "user2",
        })
      ).rejects.toThrow("User already exists with this email");
    });
  });

  describe("updateUserStats", () => {
    test("should update user stats", async () => {
      const user = await userService.registerUser({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });

      const stats = {
        totalGames: 10,
        totalWins: 5,
        highScore: 1000,
      };

      const result = await userService.updateUserStats(user.id, stats);
      expect(result.totalGames).toBe(10);
      expect(result.totalWins).toBe(5);
      expect(result.highScore).toBe(1000);
    });
  });

  describe("getUserStats", () => {
    test("should return user stats", async () => {
      const user = await userService.registerUser({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });

      await userService.updateUserStats(user.id, {
        totalGames: 10,
        totalWins: 5,
      });

      const stats = await userService.getUserStats(user.id);
      expect(stats.totalGames).toBe(10);
      expect(stats.totalWins).toBe(5);
    });
  });

  describe("searchUsersByUsername", () => {
    beforeEach(async () => {
      await userService.registerUser({
        email: "alice@example.com",
        password: "password123",
        username: "alice",
      });
      await userService.registerUser({
        email: "alicia@example.com",
        password: "password123",
        username: "alicia",
      });
      await userService.registerUser({
        email: "bob@example.com",
        password: "password123",
        username: "bob",
      });
    });

    test("should search users by username prefix", async () => {
      const results = await userService.searchUsersByUsername("ali");
      expect(results).toHaveLength(2);
      expect(results.map((u) => u.username)).toContain("alice");
      expect(results.map((u) => u.username)).toContain("alicia");
    });

    test("should return empty array for no matches", async () => {
      const results = await userService.searchUsersByUsername("xyz");
      expect(results).toHaveLength(0);
    });

    test("should not include passwords in results", async () => {
      const results = await userService.searchUsersByUsername("ali");
      results.forEach((user) => {
        expect(user.password).toBeUndefined();
      });
    });
  });
});
