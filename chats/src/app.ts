import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import { ExceptionRoutesController } from './modules/errors/exceptionRoutes.controller.js';
import routes from './infra/routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);
app.use(new ExceptionRoutesController().routeNotFound);

export default app;
