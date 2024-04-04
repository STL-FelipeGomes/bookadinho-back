import { prismaClient } from '../../infra/database/prisma/prisma.js';

export class UserUsecase {
  constructor() {}

  public async createUser(userId: string) {
    try {
      await prismaClient.users.create({
        data: {
          id: userId,
        },
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async deleteUser(userId: string) {
    try {
      await prismaClient.users.delete({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  public async getDBUser(
    where: {
      id?: string;
    },
    select: {
      id?: boolean;
    }
  ) {
    try {
      return await prismaClient.users.findUnique({
        where: {
          id: where.id,
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
