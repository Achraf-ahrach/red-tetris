import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { AuthController } from "../../src/controllers/authController.js";

describe("AuthController", () => {
  let authController;
  let mockUserService;
  let req;
  let res;

  beforeEach(() => {
    // Create a mock user service
    mockUserService = {
      registerUser: jest.fn(),
      loginUser: jest.fn(),
      getUserById: jest.fn(),
      generateJWT: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    authController = new AuthController();
    // Replace the userService with our mock
    authController.userService = mockUserService;

    req = {
      params: {},
      body: {},
      user: null,
      logout: jest.fn(),
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    };

    // Set up environment variables
    process.env.CLIENT_URL = "http://localhost:5173";
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("AuthController Class", () => {
    test("should be instantiated correctly", () => {
      expect(authController).toBeDefined();
      expect(authController.userService).toBeDefined();
    });

    test("should have register method", () => {
      expect(typeof authController.register).toBe("function");
    });

    test("should have login method", () => {
      expect(typeof authController.login).toBe("function");
    });

    test("should have refreshToken method", () => {
      expect(typeof authController.refreshToken).toBe("function");
    });

    test("should have fortyTwoCallback method", () => {
      expect(typeof authController.fortyTwoCallback).toBe("function");
    });
  });

  describe("register", () => {
    const validRegistrationData = {
      email: "test@example.com",
      password: "password123",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
    };

    test("should register user successfully", async () => {
      req.body = validRegistrationData;
      const mockUser = { id: 1, ...validRegistrationData };
      mockUserService.registerUser.mockResolvedValue(mockUser);

      await authController.register(req, res);

      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        validRegistrationData
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
      });
    });

    test("should return 400 when email is missing", async () => {
      req.body = { ...validRegistrationData, email: undefined };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email, password, and username are required",
      });
    });

    test("should return 400 when password is missing", async () => {
      req.body = { ...validRegistrationData, password: undefined };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email, password, and username are required",
      });
    });

    test("should return 400 when username is missing", async () => {
      req.body = { ...validRegistrationData, username: undefined };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email, password, and username are required",
      });
    });

    test("should return 400 when password is too short", async () => {
      req.body = { ...validRegistrationData, password: "12345" };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    });

    test("should handle registration errors", async () => {
      req.body = validRegistrationData;
      const errorMessage = "Email already exists";
      mockUserService.registerUser.mockRejectedValue(new Error(errorMessage));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });
  });

  describe("login", () => {
    test("should login user successfully", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };
      req.body = credentials;

      const mockUser = {
        id: 1,
        email: credentials.email,
        username: "testuser",
      };
      const mockAccessToken = "access-token";
      const mockRefreshToken = "refresh-token";

      mockUserService.loginUser.mockResolvedValue(mockUser);
      mockUserService.generateJWT.mockReturnValue(mockAccessToken);
      mockUserService.generateRefreshToken.mockReturnValue(mockRefreshToken);

      await authController.login(req, res);

      expect(mockUserService.loginUser).toHaveBeenCalledWith(
        credentials.email,
        credentials.password
      );
      expect(res.json).toHaveBeenCalledWith({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    test("should return 400 when email is missing", async () => {
      req.body = { password: "password123" };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email and password are required",
      });
    });

    test("should return 400 when password is missing", async () => {
      req.body = { email: "test@example.com" };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email and password are required",
      });
    });

    test("should return 401 on invalid credentials", async () => {
      req.body = { email: "test@example.com", password: "wrongpassword" };
      const errorMessage = "Invalid credentials";
      mockUserService.loginUser.mockRejectedValue(new Error(errorMessage));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("refreshToken", () => {
    test("should refresh tokens successfully", async () => {
      const oldRefreshToken = "old-refresh-token";
      req.body = { refreshToken: oldRefreshToken };

      const mockDecoded = { id: 1, type: "refresh" };
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
      };
      const newAccessToken = "new-access-token";
      const newRefreshToken = "new-refresh-token";

      mockUserService.verifyRefreshToken.mockReturnValue(mockDecoded);
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.generateJWT.mockReturnValue(newAccessToken);
      mockUserService.generateRefreshToken.mockReturnValue(newRefreshToken);

      await authController.refreshToken(req, res);

      expect(mockUserService.verifyRefreshToken).toHaveBeenCalledWith(
        oldRefreshToken
      );
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });

    test("should return 401 when refresh token is missing", async () => {
      req.body = {};

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Refresh token required",
      });
    });

    test("should return 401 when token type is invalid", async () => {
      req.body = { refreshToken: "invalid-token" };
      mockUserService.verifyRefreshToken.mockReturnValue({
        id: 1,
        type: "access",
      });

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid refresh token",
      });
    });

    test("should return 401 when user not found", async () => {
      req.body = { refreshToken: "valid-token" };
      mockUserService.verifyRefreshToken.mockReturnValue({
        id: 999,
        type: "refresh",
      });
      mockUserService.getUserById.mockResolvedValue(null);

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should return 401 on verification error", async () => {
      req.body = { refreshToken: "invalid-token" };
      mockUserService.verifyRefreshToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid refresh token",
      });
    });
  });

  describe("getCurrentUser", () => {
    test("should return current user", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
      };
      req.user = mockUser;

      await authController.getCurrentUser(req, res);

      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    test("should handle errors", async () => {
      Object.defineProperty(req, "user", {
        get: () => {
          throw new Error("User error");
        },
      });

      await authController.getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "User error",
      });
    });
  });

  describe("logout", () => {
    test("should logout successfully", () => {
      req.logout = jest.fn((callback) => callback(null));

      authController.logout(req, res);

      expect(req.logout).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });

    test("should handle logout errors", () => {
      req.logout = jest.fn((callback) => callback(new Error("Logout failed")));

      authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Logout failed" });
    });
  });

  describe("fortyTwoCallback", () => {
    test("should redirect with tokens on successful authentication", async () => {
      const mockUser = { id: 1, email: "test@42.fr", username: "testuser" };
      req.user = mockUser;

      const mockAccessToken = "access-token";
      const mockRefreshToken = "refresh-token";

      mockUserService.generateJWT.mockReturnValue(mockAccessToken);
      mockUserService.generateRefreshToken.mockReturnValue(mockRefreshToken);

      await authController.fortyTwoCallback(req, res);

      const expectedUrl = `http://localhost:5173/auth/success?token=${encodeURIComponent(
        mockAccessToken
      )}&refresh=${encodeURIComponent(mockRefreshToken)}`;

      expect(res.redirect).toHaveBeenCalledWith(expectedUrl);
    });

    test("should redirect to error page when user is missing", async () => {
      req.user = null;

      await authController.fortyTwoCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining("/auth/error")
      );
      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining("Authentication%20failed")
      );
    });

    test("should redirect to error page on exception", async () => {
      req.user = { id: 1 };
      mockUserService.generateJWT.mockImplementation(() => {
        throw new Error("Token generation failed");
      });

      await authController.fortyTwoCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining("/auth/error")
      );
    });
  });

  // Additional basic validation tests
  describe("Input Validation Helpers", () => {
    test("should validate email format", () => {
      const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };

      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });

    test("should validate password length", () => {
      const isValidPassword = (password) => {
        return Boolean(password && password.length >= 6);
      };

      expect(isValidPassword("password123")).toBe(true);
      expect(isValidPassword("123")).toBe(false);
      expect(isValidPassword("")).toBe(false);
      expect(isValidPassword(null)).toBe(false);
      expect(isValidPassword(undefined)).toBe(false);
    });
  });
});
