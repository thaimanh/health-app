import { Router } from 'express';
// import { authMiddleware } from '../../../middleware/auth.middleware';
import { validationMiddleware } from '../../../middleware';
import userController from './user.controller';
import { createUserSchema, updateUserSchema } from '../user/user.validation';

const router = Router();

// Public routes
// router.post('/register', validationMiddleware(createUserSchema), userController.register);

// router.post('/login', userController.login);

// Protected routes
// router.use(authMiddleware);

router.get('/', userController.getUsers);

router.get('/:id', userController.getUserById);

router.put('/:id', validationMiddleware(updateUserSchema), userController.updateUser);

router.delete('/:id', userController.deleteUser);

export default router;
