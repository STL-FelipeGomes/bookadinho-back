import { prismaClient } from '../../infra/database/prisma/prisma.js';
import { ChatCreate, ChatStatusUpdate } from './dtos/chat.dtos.js';

export class ChatUsecase {
  constructor() {}
  public async getAllChats(
    user_id: string,
    isGetAllChats: boolean,
    quantityBooks = 10,
    page = 0,
    filterStatus: 'open' | 'closed' | 'pending' | undefined
  ) {
    let search: undefined | string | { not: string } = isGetAllChats ? undefined : { not: 'closed' };
    if (filterStatus) {
      search = filterStatus;
    }
    try {
      return await prismaClient.chats.findMany({
        where: {
          AND: {
            status: search,
            OR: [
              {
                sender_id: user_id,
              },
              {
                receiver_id: user_id,
              },
            ],
          },
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
  public async createChats(data: { sender_id: string; receiver_id: string; envite_message: string }) {
    try {
      const chatValidated = ChatCreate.safeParse(data);
      if (!chatValidated.success) throw chatValidated.error;
      return await prismaClient.chats.create({ data });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async updateChat(chatId: string, status: 'pending' | 'closed' | 'open') {
    const chatValidatedStatus = ChatStatusUpdate.safeParse(status);
    if (!chatValidatedStatus.success) throw chatValidatedStatus.error;
    try {
      return await prismaClient.chats.update({
        where: {
          id: chatId,
        },
        data: {
          status,
        },
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async getChatById(chatId: string) {
    try {
      return await prismaClient.chats.findFirst({
        where: {
          id: chatId,
        },
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async getDBChat(
    where: {
      id?: string;
      status?: string;
      sender_id?: string;
      receiver_id?: string;
    },
    select: {
      id?: boolean;
      status?: boolean;
      sender_id?: boolean;
      receiver_id?: boolean;
    }
  ) {
    try {
      return await prismaClient.chats.findUnique({
        where: {
          id: where.id,
          status: where.status,
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
