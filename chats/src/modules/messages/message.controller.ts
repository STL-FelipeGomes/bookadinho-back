import { Request, Response } from 'express';
import { MessageUsecase } from './message.usecase.js';
import { ChatUsecase } from '../chats/chat.usecase.js';
import { ZodError } from 'zod';

export class MessageController {
  private messageUsecase = new MessageUsecase();
  private chatUsecase = new ChatUsecase();
  constructor() {}

  public async getMessageByChatId(request: Request, response: Response) {
    const { id: chatId } = request.params;
    const { quantity: quantityMessage = 10, page = 0 } = request.query;
    if (isNaN(Number(quantityMessage)) || isNaN(Number(page)) || Number(quantityMessage) < 1 || Number(page) < 0) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/quantity/ and /page/ must be positive numbers!',
        },
      });
    }

    try {
      const messagesConsulted = await this.messageUsecase.getMessageByChatId(
        chatId,
        Number(quantityMessage),
        Number(page)
      );
      return response.status(200).send({ body: { status_code: 200, status: 'success', messages: messagesConsulted } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async createMessage(request: Request, response: Response) {
    const { chat_id, message } = request.body;
    const { user_id } = response.locals;

    try {
      const chat = await this.chatUsecase.getChatById(chat_id);
      // if (chat?.status !== 'open') {
      //   return response.status(401).send({
      //     body: {
      //       status_code: 401,
      //       status: 'fail',
      //       message: 'Cannot send message to status that is not open!',
      //     },
      //   });
      // }
      if (!chat || (chat?.sender_id !== user_id && chat?.receiver_id !== user_id)) {
        return response.status(401).send({
          body: {
            status_code: 401,
            status: 'fail',
            message: 'The parameters of the request body are incorrect!',
          },
        });
      }
      const receiverId = user_id === chat.receiver_id ? chat.sender_id : chat.receiver_id;
      const messageCreated = await this.messageUsecase.createMessage({
        chat_id,
        message,
        sender_id: user_id,
        receiver_id: receiverId,
      });
      return response.status(201).send({ body: { status_code: 201, status: 'success', messages: messageCreated } });
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
