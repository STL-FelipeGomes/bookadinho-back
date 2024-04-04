import { Request, Response, NextFunction } from 'express';
import { TokenUsercase } from '../modules/tokens/token.usercase.js';
import jwt from 'jsonwebtoken';

export class Auth {
  private tokenUserCase = new TokenUsercase();
  constructor() {}

  public async verifyAuthentication(request: Request, response: Response, next: NextFunction) {
    const { authorization } = request.headers;
    if (!authorization) {
      return response.status(401).send({
        body: {
          status_code: 401,
          status: 'fail',
          message: 'AuthorizationProfile is required!',
        },
      });
    }
    try {
      const tokenConsulted = await this.tokenUserCase.verifyToken(authorization);
      if (!tokenConsulted) {
        return response.status(401).json({
          body: {
            status_code: 401,
            status: 'fail',
            message: 'Invalid token for the request!',
          },
        });
      }
      response.locals.user_id = tokenConsulted;
      return next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.cause === 'ERR:TOKEN:0001') {
          return response.status(401).json({
            body: {
              status_code: 401,
              status: 'fail',
              message: error.message,
            },
          });
        }
      }
      if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
        return response.status(401).json({
          body: {
            status_code: 401,
            status: 'fail',
            message: 'Invalid token for the request!',
          },
        });
      }
      return response.status(500).json({
        body: {
          status_code: 500,
          status: 'fail',
          message: 'Internal Server Error!',
        },
      });
    }
  }
}
