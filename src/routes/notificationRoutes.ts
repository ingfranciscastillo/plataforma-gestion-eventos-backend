import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener mis notificaciones
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, notificationController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: Marcar todas como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.put('/mark-all-read', authMiddleware, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     summary: Marcar notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:notificationId/read', authMiddleware, notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: Eliminar notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);

export default router;