import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

export const initializeSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    socket.on('join-room', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`Usuario ${userId} se unió a su sala`);
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io no está inicializado');
  }
  return io;
};

export const emitToUser = (userId: number, event: string, data: any) => {
  getIO().to(`user-${userId}`).emit(event, data);
};

export const emitToAll = (event: string, data: any) => {
  getIO().emit(event, data);
};