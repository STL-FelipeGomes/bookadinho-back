import { prismaClient } from '../../infra/database/prisma/prisma.js';
import { messageCreate } from './dtos/message.dtos.js';
import { SocketUsecase } from '../socket/socket.usecase.js';

export class MessageUsecase {
  constructor() {}

  public async getMessageByChatId(chatId: string, quantityBooks = 10, page = 0) {
    try {
      return await prismaClient.messages.findMany({
        where: {
          chat_id: chatId,
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: quantityBooks * page,
        take: quantityBooks,
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async createMessage(data: { chat_id: string; sender_id: string; receiver_id: string; message: string }) {
    try {
      const messageValidated = messageCreate.safeParse(data);
      if (!messageValidated.success) throw messageValidated.error;
      const message = await prismaClient.messages.create({ data });
      SocketUsecase.toEmit({ chat_id: data.chat_id, message });
      return message;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async getDBMessage(
    where: {
      id?: string;
      status?: string;
      message?: string;
      chat_id?: string;
      sender_id?: string;
      receiver_id?: string;
    },
    select: {
      id?: boolean;
      status?: boolean;
      message?: boolean;
      chat_id?: boolean;
      sender_id?: boolean;
      receiver_id?: boolean;
    }
  ) {
    try {
      return await prismaClient.messages.findUnique({
        where: {
          id: where.id,
          status: where.status,
          message: where.message,
          chat_id: where.chat_id,
          sender_id: where.sender_id,
          receiver_id: where.receiver_id,
        },
        select,
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown) {
    console.debug('\x1b[31m[<<<---START ERROR--->>>]\x1b[0m');
    console.error(error);
    console.debug('\x1b[31m[<<<---END ERROR--->>>]\x1b[0m');
  }
}
