import { type Request, type Response } from 'express';
import { db } from '../config/db/index.js';
import { events, users, registrations } from '../config/db/schema.js';
import { eq, desc, and, gte } from 'drizzle-orm';
import { z } from 'zod';
import { emitToAll } from '../services/socketService.js';

const createEventSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  location: z.string().min(3, 'La ubicación es requerida'),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  endDate: z.string().datetime('Fecha de fin inválida'),
  capacity: z.number().int().positive('La capacidad debe ser mayor a 0'),
  isPremium: z.boolean().optional(),
  price: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
});

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = createEventSchema.parse(req.body);

    const [newEvent] = await db
      .insert(events)
      .values({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        organizerId: userId,
        status: data.status || 'draft',
      })
      .returning();

    if (newEvent.status === 'published') {
      emitToAll('event-created', {
        id: newEvent.id,
        title: newEvent.title,
        startDate: newEvent.startDate,
      });
    }

    res.status(201).json({
      message: 'Evento creado exitosamente',
      event: newEvent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Error de validación', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Error al crear evento' });
  }
};

export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, upcoming } = req.query;

    let query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        startDate: events.startDate,
        endDate: events.endDate,
        capacity: events.capacity,
        isPremium: events.isPremium,
        price: events.price,
        imageUrl: events.imageUrl,
        status: events.status,
        createdAt: events.createdAt,
        organizer: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id));

    if (status === 'published') {
      query = query.where(eq(events.status, 'published'));
    }

    if (upcoming === 'true') {
      query = query.where(
        and(
          eq(events.status, 'published'),
          gte(events.startDate, new Date())
        )
      );
    }

    const result = await query.orderBy(desc(events.createdAt));

    res.json({ events: result });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await db.query.events.findFirst({
      where: eq(events.id, parseInt(id)),
      with: {
        organizer: {
          columns: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }

    const registrationCount = await db
      .select()
      .from(registrations)
      .where(eq(registrations.eventId, parseInt(id)));

    res.json({
      event: {
        ...event,
        registeredCount: registrationCount.length,
        availableSpots: event.capacity - registrationCount.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener evento' });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const data = createEventSchema.partial().parse(req.body);

    const event = await db.query.events.findFirst({
      where: eq(events.id, parseInt(id)),
    });

    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }

    if (event.organizerId !== userId) {
      res.status(403).json({ error: 'No tienes permiso para editar este evento' });
      return;
    }

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const [updatedEvent] = await db
      .update(events)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(events.id, parseInt(id)))
      .returning();

    if (updatedEvent.status === 'published') {
      emitToAll('event-updated', {
        id: updatedEvent.id,
        title: updatedEvent.title,
      });
    }

    res.json({
      message: 'Evento actualizado exitosamente',
      event: updatedEvent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Error de validación', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const event = await db.query.events.findFirst({
      where: eq(events.id, parseInt(id)),
    });

    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }

    if (event.organizerId !== userId) {
      res.status(403).json({ error: 'No tienes permiso para eliminar este evento' });
      return;
    }

    await db.delete(events).where(eq(events.id, parseInt(id)));

    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
};

export const getMyEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const myEvents = await db.query.events.findMany({
      where: eq(events.organizerId, userId),
      orderBy: desc(events.createdAt),
    });

    res.json({ events: myEvents });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tus eventos' });
  }
};