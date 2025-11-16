import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './services/socketService.js';

const PORT = process.env.PORT || 3000;

const server = createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
  console.log(`
    🚀 Servidor ejecutándose en http://localhost:${PORT}
    📚 Documentación API: http://localhost:${PORT}/api-docs
    🔌 WebSocket: ws://localhost:${PORT}
    ⚡ Ambiente: ${process.env.NODE_ENV || 'development'}
  `);
});