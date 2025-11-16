import { Router } from 'express';
import * as eventController from '../controllers/eventController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Obtener todos los eventos
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 */
router.get('/', eventController.getAllEvents);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Crear nuevo evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, eventController.createEvent);

/**
 * @swagger
 * /api/events/my-events:
 *   get:
 *     summary: Obtener mis eventos creados
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-events', authMiddleware, eventController.getMyEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Obtener evento por ID
 *     tags: [Events]
 */
router.get('/:id', eventController.getEventById);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Actualizar evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, eventController.updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Eliminar evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, eventController.deleteEvent);

export default router;