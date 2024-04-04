import jwt from 'jsonwebtoken';
import { RedisUsecase } from '../redis/redis.usecase.js';
import { UserUsecase } from '../users/user.usecase.js';

export class TokenUsercase extends RedisUsecase {
  private key = process.env.JWT_KEY || 'bola';
  private userUsecase = new UserUsecase();
  constructor() {
    super();
  }

  public async createToken(userId: string) {
    try {
      const token = jwt.sign({ userId }, this.key, {
        expiresIn: '2 days',
        algorithm: 'HS256',
      });
      await this.insertToken(token, userId);
      return token;
    } catch (error: unknown) {
      super.handleError(error);
      throw error;
    }
  }
  public validationToken(token: string) {
    try {
      return jwt.verify(token, this.key);
    } catch (error) {
      super.handleError(error);
      throw error;
    }
  }
  public async verifyToken(token: string) {
    let valueToken: { userId: string; iat: number; exp: number };
    try {
      valueToken = this.validationToken(token) as { userId: string; iat: number; exp: number };
    } catch (error) {
      throw error;
    }
    try {
      const [validTokenByRedis, validUserByDatabase] = await Promise.all([
        super.getValueKey(`token:${valueToken.userId}:${token}`),
        this.userUsecase.getDBUser({ id: valueToken.userId }, { id: true }),
      ]);
      if (!validTokenByRedis || !validUserByDatabase) {
        throw new Error('Invalid token for the request!', {
          cause: 'ERR:TOKEN:0001',
        });
      }
      await super.updatedDurationKey(`token:${valueToken.userId}:${token}`, 172800, 'GT');
      return validUserByDatabase.id;
    } catch (error) {
      throw error;
    }
  }
  public async deleteTokens(useId: string) {
    try {
      await super.deleteKeys(`*token:${useId}*`);
    } catch (error) {
      super.handleError(error);
      throw error;
    }
  }
  public async deleteToken(token: string, userId: string) {
    try {
      await super.deleteKeys(`*token:${userId}:${token}*`);
    } catch (error) {
      super.handleError(error);
      throw error;
    }
  }
  private async insertToken(token: string, userId: string) {
    try {
      await super.setKey(`token:${userId}:${token}`, token, 172800);
    } catch (error) {
      super.handleError(error);
      throw error;
    }
  }
}
