import { Router } from 'express';
import { UserController } from '../modules/users/user.controller.js';
import { Auth } from '../middleware/auth.provider.js';
import { ExceptionRoutesController } from '../modules/errors/exceptionRoutes.controller.js';

const routes = Router();

const userController = new UserController();
const auth = new Auth();

routes
  .get('/users/:allusers(true)?', userController.getAllUsers.bind(userController))
  .get('/users/:search', userController.getUserByUsernameOrUserId.bind(userController))
  .post('/users', userController.createUser.bind(userController))
  .post('/users/auth', userController.loginUser.bind(userController))
  .put('/users/:id', auth.verifyAuthentication.bind(auth), userController.updateUser.bind(userController))
  .delete('/users/:id', auth.verifyAuthentication.bind(auth), userController.deleteUser.bind(userController))
  .delete('/users/logout/:id', auth.verifyAuthentication.bind(auth), userController.logoutUser.bind(userController))
  .get('/', new ExceptionRoutesController().routeRoot);

export default routes;
