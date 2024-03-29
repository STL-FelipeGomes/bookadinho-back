import { Request, Response } from 'express';
import { ChatUsecase } from './chat.usecase.js';
import { UserUsecase } from '../users/user.usecase.js';
import { ZodError } from 'zod';

export class ChatController {
  private userUsecase = new UserUsecase();
  private chatUsecase = new ChatUsecase();
  constructor() {}

  public async getAllChats(request: Request, response: Response) {
    const { allchats: allChats = false } = request.params;
    const { quantity: quantityBooks = 10, page = 0, filter: filterStatus } = request.query;
    if (isNaN(Number(quantityBooks)) || isNaN(Number(page)) || Number(quantityBooks) < 1 || Number(page) < 0) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/quantity/ and /page/ must be positive numbers!',
        },
      });
    }
    if (filterStatus && !/^(open|closed|pending)$/.test(String(filterStatus))) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/filter/ needs to be [open|closed|pending]',
        },
      });
    }
    try {
      const booksConsulted = await this.chatUsecase.getAllChats(
        !!allChats,
        Number(quantityBooks),
        Number(page),
        filterStatus as 'open' | 'closed' | 'pending' | undefined
      );
      return response.status(200).send({ body: { status_code: 200, status: 'success', chats: booksConsulted } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async createChat(request: Request, response: Response) {
    const { sender_id = '', receiver_id = '' } = request.body;
    const { user_id } = response.locals;

    if (user_id !== sender_id) {
      return response.status(401).send({
        body: {
          status_code: 401,
          status: 'fail',
          message: 'The /sender_id/ field does not match the requester!',
        },
      });
    }

    try {
      const [sender, receiver] = await Promise.all([
        this.userUsecase.getDBUser({ id: sender_id }, { id: true }),
        this.userUsecase.getDBUser({ id: receiver_id }, { id: true }),
      ]);
      if (!sender || !receiver) {
        return response.status(400).send({
          body: {
            status_code: 400,
            status: 'fail',
            message: 'The /sender_id/ or /receive_id/ fields are not correct!',
          },
        });
      }
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }

    try {
      const chatCreated = await this.chatUsecase.createChats({ sender_id, receiver_id });
      return response.status(201).send({ body: { status_code: 201, status: 'success', chats: chatCreated } });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const { errors } = error;
        let messageError = '';
        errors.forEach((error) => (messageError += `The parameter /${error.path[0]}/ ${error.message}; `));
        return response.status(400).send({
          body: {
            status_code: 400,
            status: 'fail',
            message: messageError,
          },
        });
      }
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async updateChat(request: Request, response: Response) {
    const { id } = request.params;
    const { status }: { status: 'pending' | 'closed' | 'open' } = request.body;

    if (!/^(open|closed|pending)$/.test(status)) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: 'The /status/ needs to be [open|closed|pending]',
        },
      });
    }
    try {
      const chat = await this.chatUsecase.getDBChat({ id: id }, { status: true, receiver_id: true });
      if (chat?.status === status) {
        return response.status(401).send({
          body: {
            status_code: 401,
            status: 'fail',
            message: "You can't update to the same status!",
          },
        });
      }
      if (chat?.status === 'closed') {
        return response.status(401).send({
          body: {
            status_code: 401,
            status: 'fail',
            message: "You can't update a closed chat!",
          },
        });
      }
      if (status === 'pending') {
        return response.status(401).send({
          body: {
            status_code: 401,
            status: 'fail',
            message: "You can't update the status to pending!",
          },
        });
      }
      if (!chat?.receiver_id) {
        return response.status(404).send({
          body: {
            status_code: 404,
            status: 'fail',
            message: 'The /chat_id/ not found!',
          },
        });
      }
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }

    try {
      const updatedChat = await this.chatUsecase.updateChat(id, status);
      return response.status(200).json({
        body: {
          status_code: 200,
          status: 'success',
          chats: updatedChat,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const { errors } = error;
        let messageError = '';
        errors.forEach((error) => (messageError += `The parameter /${error.path[0]}/ ${error.message}; `));
        return response.status(400).send({
          body: {
            status_code: 400,
            status: 'fail',
            message: messageError,
          },
        });
      }
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
}
