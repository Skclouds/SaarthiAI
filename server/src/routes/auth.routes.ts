import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/register',
  validate([
    body('businessName').trim().notEmpty().withMessage('Business name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ]),
  authController.register,
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login,
);

router.post(
  '/forgot-password',
  validate([body('email').isEmail().withMessage('Valid email is required')]),
  authController.forgotPassword,
);

router.post(
  '/google',
  validate([
    body('credential').notEmpty().withMessage('Google credential is required'),
  ]),
  authController.googleAuth,
);

export default router;
