import { Router } from 'express';
import * as commentController from '../controllers/commentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/comments/event/{eventId}:
 *   get:
 *     summary: Obtener comentarios de un evento
 *     tags: [Comments]
 */
router.get('/event/:eventId', commentController.getEventComments);

/**
 * @swagger
 * /api/comments/event/{eventId}:
 *   post:
 *     summary: Crear comentario en un evento
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/event/:eventId', authMiddleware, commentController.createComment);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   put:
 *     summary: Actualizar comentario
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:commentId', authMiddleware, commentController.updateComment);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     summary: Eliminar comentario
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:commentId', authMiddleware, commentController.deleteComment);

export default router;