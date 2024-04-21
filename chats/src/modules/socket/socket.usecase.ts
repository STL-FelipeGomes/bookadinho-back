import { io } from '../../bin/www/server.socket.js';
import { MessageType } from '../messages/dtos/message.dtos.js';

export class SocketUsecase {
  private io = io;

  constructor() {
    io.on('connection', (socket) => {
      socket.on('chat_room', async (data: { id: string }) => {
        socket.join(data.id);
      });
    });
  }

  public static toEmit({ chat_id, message }: { chat_id: string; message: MessageType }) {
    return io.to(chat_id).emit('message', message);
  }
}
