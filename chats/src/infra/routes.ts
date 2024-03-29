import { Router } from 'express';
import { ChatController } from '../modules/chat/chat.controller.js';
import { Auth } from '../middleware/auth.provider.js';
import { ExceptionRoutesController } from '../modules/errors/exceptionRoutes.controller.js';

const routes = Router();

const chatController = new ChatController();
const auth = new Auth();

routes
  .get(`/chats/:allchats(true)?`, auth.verifyAuthentication.bind(auth), chatController.getAllChats.bind(chatController))
  .post('/chats', auth.verifyAuthentication.bind(auth), chatController.createChat.bind(chatController))
  .put('/chats/:id', auth.verifyAuthentication.bind(auth), chatController.updateChat.bind(chatController))
  .get('/', new ExceptionRoutesController().routeRoot);

export default routes;
