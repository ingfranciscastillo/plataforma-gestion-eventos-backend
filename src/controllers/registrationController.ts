import { type Request, type Response } from 'express';
import { db } from '../config/db/index.js';
import { registrations, events, users } from '../config/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { createPaymentIntent } from '../services/stripeService.js';
import { sendRegistrationConfirmation } from '../services/emailService.js';
import { emitToUser } from '../services/socketService.js';

export const registerToEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user!.userId;

    const event = await db.query.events.findFirst({
      where: eq(events.id, parseInt(eventId)),
    });

    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }

    if (event.status !== 'published') {
      res.status(400).json({ error: 'El evento no está disponible para registro' });
      return;
    }

    const existingRegistration = await db.query.registrations.findFirst({
      where: and(
        eq(registrations.eventId, parseInt(eventId)),
        eq(registrations.userId, userId)
      ),
    });

    if (existingRegistration) {
      res.status(400).json({ error: 'Ya estás registrado en este evento' });
      return;
    }

    const registrationCount = await db
      .select()
      .from(registrations)
      .where(eq(registrations.eventId, parseInt(eventId)));

    if (registrationCount.length >= event.capacity) {
      res.status(400).json({ error: 'El evento está lleno' });
      return;
    }

    let paymentIntentId = null;
    let isPaid = false;

    if (event.isPremium && parseFloat(event.price!) > 0) {
      const paymentIntent = await createPaymentIntent(
        parseFloat(event.price!),
        parseInt(eventId),
        userId
      );
      paymentIntentId = paymentIntent.id;
    } else {
      isPaid = true;
    }

    const [registration] = await db
      .insert(registrations)
      .values({
        userId,
        eventId: parseInt(eventId),
        status: isPaid ? 'confirmed' : 'pending',
        paymentIntentId,
        isPaid,
      })
      .returning();

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (isPaid && user) {
      await sendRegistrationConfirmation(
        user.email,
        event.title,
        event.startDate
      );

      emitToUser(userId, 'registration-confirmed', {
        eventId: event.id,
        eventTitle: event.title,
      });
    }

    res.status(201).json({
      message: event.isPremium && !isPaid 
        ? 'Registro iniciado. Completa el pago para confirmar' 
        : 'Registro confirmado exitosamente',
      registration,
      clientSecret: paymentIntentId ? (await createPaymentIntent(
        parseFloat(event.price!),
        parseInt(eventId),
        userId
      )).client_secret : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrarse en el evento' });
  }
};

export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { registrationId } = req.params;
    const { paymentIntentId } = req.body;
    const userId = req.user!.userId;

    const registration = await db.query.registrations.findFirst({
      where: and(
        eq(registrations.id, parseInt(registrationId)),
        eq(registrations.userId, userId)
      ),
      with: {
        event: true,
        user: true,
      },
    });

    if (!registration) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }

    const [updatedRegistration] = await db
      .update(registrations)
      .set({
        status: 'confirmed',
        isPaid: true,
        paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(registrations.id, parseInt(registrationId)))
      .returning();

    await sendRegistrationConfirmation(
      registration.user.email,
      registration.event.title,
      registration.event.startDate
    );

    emitToUser(userId, 'payment-confirmed', {
      registrationId: updatedRegistration.id,
      eventTitle: registration.event.title,
    });

    res.json({
      message: 'Pago confirmado y registro completado',
      registration: updatedRegistration,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al confirmar el pago' });
  }
};

export const getMyRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const myRegistrations = await db.query.registrations.findMany({
      where: eq(registrations.userId, userId),
      with: {
        event: {
          with: {
            organizer: {
              columns: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.json({ registrations: myRegistrations });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tus registros' });
  }
};

export const cancelRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { registrationId } = req.params;
    const userId = req.user!.userId;

    const registration = await db.query.registrations.findFirst({
      where: and(
        eq(registrations.id, parseInt(registrationId)),
        eq(registrations.userId, userId)
      ),
    });

    if (!registration) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }

    await db
      .update(registrations)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(registrations.id, parseInt(registrationId)));

    res.json({ message: 'Registro cancelado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar el registro' });
  }
};

export const getEventRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user!.userId;

    const event = await db.query.events.findFirst({
      where: eq(events.id, parseInt(eventId)),
    });

    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }

    if (event.organizerId !== userId) {
      res.status(403).json({ error: 'No tienes permiso para ver estos registros' });
      return;
    }

    const eventRegistrations = await db.query.registrations.findMany({
      where: eq(registrations.eventId, parseInt(eventId)),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json({ registrations: eventRegistrations });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener registros del evento' });
  }
};