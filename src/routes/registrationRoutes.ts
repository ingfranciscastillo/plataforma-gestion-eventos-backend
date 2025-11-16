import { Router } from 'express';
import * as registrationController from '../controllers/registrationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/registrations/my-registrations:
 *   get:
 *     summary: Obtener mis registros a eventos
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-registrations', authMiddleware, registrationController.getMyRegistrations);

/**
 * @swagger
 * /api/registrations/event/{eventId}:
 *   post:
 *     summary: Registrarse a un evento
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/event/:eventId', authMiddleware, registrationController.registerToEvent);

/**
 * @swagger
 * /api/registrations/event/{eventId}/attendees:
 *   get:
 *     summary: Obtener registros de un evento (solo organizador)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/event/:eventId/attendees', authMiddleware, registrationController.getEventRegistrations);

/**
 * @swagger
 * /api/registrations/{registrationId}/confirm-payment:
 *   post:
 *     summary: Confirmar pago de registro
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:registrationId/confirm-payment', authMiddleware, registrationController.confirmPayment);

/**
 * @swagger
 * /api/registrations/{registrationId}/cancel:
 *   put:
 *     summary: Cancelar registro
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:registrationId/cancel', authMiddleware, registrationController.cancelRegistration);

export default router;