import express from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = express.Router();
const userController = new UserController();

router.get('/', authenticateJWT, userController.getUsers);
router.get('/:id', authenticateJWT, userController.getUserById);

export default router;