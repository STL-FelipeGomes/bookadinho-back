import { prismaClient } from '../../database/prismaUsers.js';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { UserValidation } from '../../dto/users.js';

export class UserUsecase {
  constructor() {}

  public async getAllUsers(allUsers = false) {
    const getUsersByOnlyActive = {
      is_activated: true,
    };
    try {
      return await prismaClient.users.findMany({
        where: allUsers ? undefined : getUsersByOnlyActive,
        select: {
          id: true,
          user_name: true,
          name: true,
          email: true,
          password: false,
          description: true,
          likes: true,
          latest_readings: true,
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
  public async getUserById(id: string) {
    try {
      return await prismaClient.users.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          user_name: true,
          name: true,
          email: true,
          password: false,
          description: true,
          likes: true,
          latest_readings: true,
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
    latest_readings,
    photo,
  }: {
    user_name: string;
    name: string;
    email: string;
    password: string;
    description: string | null;
    likes: [] | null;
    latest_readings: [] | null;
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
        password: encryptPassword,
        description,
        likes,
        latest_readings,
        photo,
        is_activated: true,
      });
      if (!userValidation.success) throw userValidation.error;
      return await prismaClient.users.create({
        data: {
          ...userValidation.data,
        },
        select: {
          id: true,
          user_name: true,
          name: true,
          email: true,
          password: false,
          description: true,
          likes: true,
          latest_readings: true,
          photo: true,
          is_activated: true,
          created_at: true,
          updated_at: true,
        },
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
      latest_readings?: boolean;
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

  private handleError(error: unknown) {
    console.debug('\x1b[31m[<<<---START ERROR--->>>]\x1b[0m');
    console.error(error);
    console.debug('\x1b[31m[<<<---END ERROR--->>>]\x1b[0m');
  }
}
