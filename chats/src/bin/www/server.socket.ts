import { Server } from 'socket.io';
import { SocketUsecase } from '../../modules/socket/socket.usecase.js';
import app from '../../app.js';

const server = app.listen();
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

new SocketUsecase();

export { io, server };
