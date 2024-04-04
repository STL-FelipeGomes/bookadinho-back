import { Router } from 'express';
import { ChatController } from '../modules/chats/chat.controller.js';
import { MessageController } from '../modules/messages/message.controller.js';
import { Auth } from '../middleware/auth.provider.js';
import { ExceptionRoutesController } from '../modules/errors/exceptionRoutes.controller.js';

const routes = Router();

const chatController = new ChatController();
const messageController = new MessageController();
const auth = new Auth();

routes
  .get(
    '/chats/message/chat/:id',
    auth.verifyAuthentication.bind(auth),
    messageController.getMessageByChatId.bind(messageController)
  )
  .post(
    '/chats/message',
    auth.verifyAuthentication.bind(auth),
    messageController.createMessage.bind(messageController)
  );

routes
  .get('/chats/:allchats(true)?', auth.verifyAuthentication.bind(auth), chatController.getAllChats.bind(chatController))
  .post('/chats', auth.verifyAuthentication.bind(auth), chatController.createChat.bind(chatController))
  .put('/chats/:id', auth.verifyAuthentication.bind(auth), chatController.updateChat.bind(chatController))
  .get('/', new ExceptionRoutesController().routeRoot);

export default routes;
