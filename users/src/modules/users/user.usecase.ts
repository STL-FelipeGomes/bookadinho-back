import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { prismaClient } from '../../infra/database/prisma/prisma.js';
import { UserValidation, UserValidationUpdated, UserValidationPassword } from './dtos/users.dto.js';
import { KafkaSendMessage } from '../../infra/kafka/producer/users/user.producer.js';
import { TokenUsercase } from '../tokens/token.usercase.js';

export class UserUsecase {
  private kafkaMessage = new KafkaSendMessage();
  private tokenUsercase = new TokenUsercase();
  constructor() {}

  public async getAllUsers(
    isGetSomeUsersActive: boolean,
    quantityUsers = 10,
    page = 0,
    searchName: string | undefined
  ) {
    try {
      return await prismaClient.users.findMany({
        where: {
          is_activated: isGetSomeUsersActive ? undefined : true,
          AND: {
            user_name: {
              contains: searchName,
            },
          },
        },
        select: {
          id: true,
          user_name: true,
          name: true,
          email: true,
          password: false,
          description: true,
          likes: true,
          photo: true,
          is_activated: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: quantityUsers * page,
        take: quantityUsers,
      });
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }
  public async getUserByUsernameOrUserId(search: string) {
    try {
      return await prismaClient.users.findFirst({
        where: {
          OR: [
            {
              user_name: search,
            },
            {
              id: search,
            },
          ],
        },
        select: {
          id: true,
          user_name: true,
          name: true,
          email: true,
          password: false,
          description: true,
          likes: true,
          photo: true,
          is_activated: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }
  public async createUser({
    user_name,
    name,
    email,
    password,
    description,
    likes,
    photo,
  }: {
    user_name: string;
    name: string;
    email: string;
    password: string;
    description: string | null;
    likes: [] | null;
    photo: string | null;
  }) {
    try {
      const isUserAlready = await prismaClient.users.findFirst({
        where: {
          OR: [
            {
              user_name: {
                contains: user_name,
              },
            },
            {
              email: {
                contains: email,
              },
            },
          ],
        },
      });
      if (isUserAlready) {
        throw new Error('database-0001', {
          cause: 'Username or email is already in use!',
        });
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
    try {
      const encryptPassword = await this.encryptPassword(password);
      const userValidation = UserValidation.safeParse({
        id: randomUUID(),
        user_name,
        name,
        email,
        password,
        description,
        likes,
        photo,
        is_activated: true,
      });
      if (!userValidation.success) throw userValidation.error;
      const userCreated = await prismaClient.users.create({
        data: {
          ...userValidation.data,
          password: encryptPassword,
        },
        select: {
          id: true,
          user_name: true,
          name: true,
          email: true,
          password: false,
          description: true,
          likes: true,
          photo: true,
          is_activated: true,
          created_at: true,
          updated_at: true,
        },
      });
      await this.kafkaMessage.execute('users', {
        action: 'create',
        body: {
          id: userCreated.id,
        },
      });
      return userCreated;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async updateUse(
    userId: string,
    data: {
      id: string;
      user_name?: string;
      name?: string;
      email?: string;
      description?: string | null;
      likes?: string[];
      photo?: string | null;
      is_activated: true;
    }
  ) {
    const userValidation = UserValidationUpdated.safeParse(data);
    if (!userValidation.success) throw userValidation.error;
    try {
      const userUpdated = await prismaClient.users.update({
        where: {
          id: userId,
        },
        data,
        select: {
          id: true,
          user_name: true,
          name: true,
          email: true,
          password: false,
          description: true,
          likes: true,
          photo: true,
          is_activated: true,
        },
      });
      return userUpdated;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async updatedPassword(userId: string, password: string) {
    try {
      const validatedPassword = UserValidationPassword.safeParse({ password });
      if (!validatedPassword.success) throw validatedPassword.error;
      const encryptPassword = await this.encryptPassword(password);
      await this.tokenUsercase.deleteTokens(userId);
      return await prismaClient.users.update({
        where: {
          id: userId,
        },
        data: {
          password: encryptPassword,
        },
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async deleteUser(userId: string) {
    try {
      await this.tokenUsercase.deleteTokens(userId);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
    try {
      await prismaClient.users.delete({
        where: {
          id: userId,
        },
      });
      await this.kafkaMessage.execute('users', {
        action: 'delete',
        body: {
          id: userId,
        },
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async loginUser(userId: string) {
    try {
      return await this.tokenUsercase.createToken(userId);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async logoutUser(userId: string, token: string) {
    try {
      await this.tokenUsercase.deleteToken(token, userId);
    } catch (error) {
      throw error;
    }
  }
  public async getDBUser(
    where: {
      id?: string;
      user_name?: string;
      name?: string;
      email?: string;
      password?: string;
      description?: string;
      photo?: string;
      is_activated?: boolean;
    },
    select: {
      id?: boolean;
      user_name?: boolean;
      name?: boolean;
      email?: boolean;
      password?: boolean;
      description?: boolean;
      likes?: boolean;
      photo?: boolean;
      is_activated?: boolean;
    }
  ) {
    try {
      return await prismaClient.users.findUnique({
        where: {
          id: where.id,
          user_name: where.user_name,
          name: where.name,
          email: where.email,
          password: where.password,
          description: where.description,
          photo: where.photo,
          is_activated: where.is_activated,
        },
        select,
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  private async encryptPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
  public async checkPassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }

  private handleError(error: unknown) {
    console.debug('\x1b[31m[<<<---START ERROR--->>>]\x1b[0m');
    console.error(error);
    console.debug('\x1b[31m[<<<---END ERROR--->>>]\x1b[0m');
  }
}
