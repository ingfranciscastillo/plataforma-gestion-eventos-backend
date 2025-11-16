import { Router } from 'express';
import passport from '../config/passport.js';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authMiddleware, authController.getProfile);

// OAuth Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/error' }),
  authController.handleOAuthCallback
);

// OAuth Facebook
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/auth/error' }),
  authController.handleOAuthCallback
);

export default router;