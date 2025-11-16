import { type Request, type Response } from 'express';
import { db } from '../config/db/index.js';
import { comments, events, registrations } from '../config/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(10, 'El comentario debe tener al menos 10 caracteres'),
  rating: z.number().int().min(1).max(5, 'La calificación debe estar entre 1 y 5'),
});

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user!.userId;
    const { content, rating } = createCommentSchema.parse(req.body);

    const event = await db.query.events.findFirst({
      where: eq(events.id, parseInt(eventId)),
    });

    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }

    const registration = await db.query.registrations.findFirst({
      where: and(
        eq(registrations.eventId, parseInt(eventId)),
        eq(registrations.userId, userId),
        eq(registrations.status, 'confirmed')
      ),
    });

    if (!registration) {
      res.status(403).json({ 
        error: 'Solo los asistentes confirmados pueden comentar' 
      });
      return;
    }

    const existingComment = await db.query.comments.findFirst({
      where: and(
        eq(comments.eventId, parseInt(eventId)),
        eq(comments.userId, userId)
      ),
    });

    if (existingComment) {
      res.status(400).json({ error: 'Ya has comentado en este evento' });
      return;
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        userId,
        eventId: parseInt(eventId),
        content,
        rating,
      })
      .returning();

    const commentWithUser = await db.query.comments.findFirst({
      where: eq(comments.id, newComment.id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Comentario creado exitosamente',
      comment: commentWithUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Error de validación', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Error al crear comentario' });
  }
};

export const getEventComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const eventComments = await db.query.comments.findMany({
      where: eq(comments.eventId, parseInt(eventId)),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: desc(comments.createdAt),
    });

    const avgRating = eventComments.length > 0
      ? eventComments.reduce((sum, c) => sum + c.rating, 0) / eventComments.length
      : 0;

    res.json({
      comments: eventComments,
      averageRating: avgRating.toFixed(1),
      totalComments: eventComments.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;
    const { content, rating } = createCommentSchema.parse(req.body);

    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, parseInt(commentId)),
    });

    if (!comment) {
      res.status(404).json({ error: 'Comentario no encontrado' });
      return;
    }

    if (comment.userId !== userId) {
      res.status(403).json({ error: 'No tienes permiso para editar este comentario' });
      return;
    }

    const [updatedComment] = await db
      .update(comments)
      .set({ content, rating, updatedAt: new Date() })
      .where(eq(comments.id, parseInt(commentId)))
      .returning();

    res.json({
      message: 'Comentario actualizado exitosamente',
      comment: updatedComment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Error de validación', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Error al actualizar comentario' });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, parseInt(commentId)),
    });

    if (!comment) {
      res.status(404).json({ error: 'Comentario no encontrado' });
      return;
    }

    if (comment.userId !== userId) {
      res.status(403).json({ error: 'No tienes permiso para eliminar este comentario' });
      return;
    }

    await db.delete(comments).where(eq(comments.id, parseInt(commentId)));

    res.json({ message: 'Comentario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
};