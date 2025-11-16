import { type Request, type Response } from 'express';
import { db } from '../config/db/index.js';
import { notifications } from '../config/db/schema.js';
import { eq, desc } from 'drizzle-orm';

export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const myNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: desc(notifications.createdAt),
      limit: 50,
    });

    const unreadCount = myNotifications.filter(n => !n.isRead).length;

    res.json({
      notifications: myNotifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.userId;

    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, parseInt(notificationId)),
    });

    if (!notification) {
      res.status(404).json({ error: 'Notificación no encontrada' });
      return;
    }

    if (notification.userId !== userId) {
      res.status(403).json({ error: 'No tienes permiso' });
      return;
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, parseInt(notificationId)));

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar notificación' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar notificaciones' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.userId;

    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, parseInt(notificationId)),
    });

    if (!notification) {
      res.status(404).json({ error: 'Notificación no encontrada' });
      return;
    }

    if (notification.userId !== userId) {
      res.status(403).json({ error: 'No tienes permiso' });
      return;
    }

    await db.delete(notifications).where(eq(notifications.id, parseInt(notificationId)));

    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
};