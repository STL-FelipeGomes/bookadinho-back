import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { UserUsecase } from './user.usecase.js';

export class UserController {
  private userUsecase = new UserUsecase();

  constructor() {}

  public async getAllUsers(request: Request, response: Response) {
    const { allusers: allUsers = false } = request.params;
    const { quantity: quantityUsers = 10, page = 0, name: searchName } = request.query;
    if (isNaN(Number(quantityUsers)) || isNaN(Number(page)) || Number(quantityUsers) < 1 || Number(page) < 0) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/quantity/ and /page/ must be positive numbers!',
        },
      });
    }
    try {
      const usersConsulted = await this.userUsecase.getAllUsers(
        !!allUsers,
        Number(quantityUsers),
        Number(page),
        searchName && String(searchName)
      );
      return response.status(200).send({ body: { status_code: 200, status: 'success', users: usersConsulted } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async getUserByUsernameOrUserId(request: Request, response: Response) {
    const { search } = request.params;
    try {
      const userConsultedById = await this.userUsecase.getUserByUsernameOrUserId(search);
      return userConsultedById
        ? response.status(200).send({ body: { status_code: 200, status: 'success', users: userConsultedById } })
        : response
            .status(404)
            .send({ body: { status_code: 404, status: 'fail', message: 'User not found by the id provided!' } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async createUser(request: Request, response: Response) {
    const {
      user_name,
      name,
      email,
      password,
      description = null,
      likes = [],
      photo = null,
    }: {
      user_name: string;
      name: string;
      email: string;
      password: string;
      description: string | null;
      likes: [] | null;
      photo: string | null;
    } = request.body;
    try {
      const userCreated = await this.userUsecase.createUser({
        user_name,
        name,
        email,
        password,
        description,
        likes,
        photo,
      });
      return response.status(201).send({
        body: { status_code: 201, status: 'success', users: userCreated },
      });
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
      if (error instanceof Error && error.message === 'database-0001') {
        return response.status(409).send({
          body: { status_code: 409, status: 'fail', message: error.cause },
        });
      }
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async loginUser(request: Request, response: Response) {
    const { user_name, password }: { user_name: string; password: string } = request.body;
    if (!user_name || !password) {
      return response.status(401).send({
        body: {
          status_code: 401,
          status: 'fail',
          message: '/username/ and /password/ are required!',
        },
      });
    }
    try {
      const user = await this.userUsecase.getDBUser(
        { user_name },
        {
          id: true,
          user_name: true,
          password: true,
          photo: true,
        }
      );
      const validatedPassword = await this.userUsecase.checkPassword(password, user?.password || '');
      if (!user || !validatedPassword) {
        return response.status(403).send({
          body: {
            status_code: 403,
            status: 'fail',
            message: 'Incorrect /username/ or /password/!',
          },
        });
      }
      const tokenByUser = await this.userUsecase.loginUser(user.id);
      return response.status(200).send({
        body: {
          status_code: 200,
          status: 'success',
          user: {
            id: user.id,
            user_name: user.user_name,
            photo: user.photo,
          },
          token: tokenByUser,
        },
      });
    } catch (error) {
      return response.status(500).send({ body: { status_code: 500, status: 'fail', message: 'Internal error!' } });
    }
  }
  public async updateUser(request: Request, response: Response) {
    const { user_id: userIdByAuthorization } = response.locals;
    const { id: userId } = request.params;
    if (userId !== userIdByAuthorization) {
      return response.status(403).json({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'The user has no authorization for the action!',
        },
      });
    }
    const {
      user_name,
      name,
      email,
      password,
      description = null,
      likes,
      photo = null,
    }: {
      user_name: string;
      name: string;
      email: string;
      password: string;
      description: string | null;
      likes: string[];
      photo: string | null;
    } = request.body;
    if (!userId) {
      return response.status(400).send({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/id/ profile id is required!',
        },
      });
    }
    try {
      const checkUser = await this.userUsecase.getDBUser(
        { id: userId },
        {
          id: true,
          user_name: true,
          name: true,
          email: true,
          password: true,
          description: true,
          likes: true,
          photo: true,
          is_activated: true,
        }
      );
      if (!checkUser) {
        return response.status(404).send({
          body: {
            status_code: 404,
            status: 'fail',
            message: 'User /id/ not found!',
          },
        });
      }
      const updateUse = await this.userUsecase.updateUse(userId, {
        id: userId,
        user_name: user_name,
        name: name,
        email: email,
        description: description,
        likes: likes,
        photo: photo,
        is_activated: true,
      });
      if (password) {
        await this.userUsecase.updatedPassword(userId, password);
        return response
          .status(200)
          .send({ body: { status_code: 200, status: 'success', message: 'User changed successfully!' } });
      }
      return response.status(200).json({
        body: {
          status_code: 200,
          status: 'success',
          users: updateUse,
        },
      });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const { errors } = error;
        let messageError = '';
        errors.forEach((error) => (messageError += `The parameter /${error.path[0] || ''}/ ${error.message}; `));
        return response.status(400).send({
          body: {
            status_code: 400,
            status: 'fail',
            message: messageError,
          },
        });
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return response
            .status(409)
            .send({ body: { status_code: 409, status: 'fail', message: 'Username or email is already in use!' } });
        }
      }
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async deleteUser(request: Request, response: Response) {
    const { user_id: userIdByAuthorization } = response.locals;
    const { id: userId } = request.params;
    if (userId !== userIdByAuthorization) {
      return response.status(403).json({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'The user has no authorization for the action!',
        },
      });
    }
    if (!userId) {
      return response.status(400).send({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/id/ is required!',
        },
      });
    }
    try {
      const checkUser = await this.userUsecase.getDBUser({ id: userId }, { id: true });
      if (!checkUser) {
        return response.status(404).send({
          body: {
            status_code: 404,
            status: 'fail',
            message: 'User /id/ not found!',
          },
        });
      }
      await this.userUsecase.deleteUser(userId);
      return response
        .status(200)
        .json({ body: { status_code: 200, status: 'success', message: 'User successfully deleted!' } });
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return response
            .status(409)
            .send({ body: { status_code: 409, status: 'fail', message: 'Username or email is already in use!' } });
        }
      }
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async logoutUser(request: Request, response: Response) {
    const { user_id: userIdByAuthorization } = response.locals;
    const { authorization: token } = request.headers;
    const { id: userId } = request.params;
    if (!token) {
      return response.status(400).send({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/token/ is required!',
        },
      });
    }
    if (userId !== userIdByAuthorization) {
      return response.status(403).json({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'The user has no authorization for the action!',
        },
      });
    }
    try {
      await this.userUsecase.logoutUser(userId, token);
      return response.status(200).json({
        body: {
          status_code: 200,
          status: 'success',
          message: 'The user logout success!',
        },
      });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
}
