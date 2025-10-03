import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService.js';

const userService = new UserService();

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = userService.verifyJWT(token);
    const user = await userService.getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = userService.verifyJWT(token);
      const user = await userService.getUserById(decoded.id);
      req.user = user;
    } catch (error) {
      // Continue without user
    }
  }
  
  next();
};