import { Request, Response } from 'express';
import { FavoriteBooksUsecase } from './favoritebooks.usecase.js';
import { ZodError } from 'zod';

export class FavoriteBooksController {
  private favoriteBooksUsecase = new FavoriteBooksUsecase();
  constructor() {}

  public async getAllFavoriteBooksByUserId(request: Request, response: Response) {
    const { id: userId } = request.params;
    const { quantity: quantityBooks = 10, page = 0 } = request.query;
    if (!userId) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: 'User /id/ is required!',
        },
      });
    }
    if (isNaN(Number(quantityBooks)) || isNaN(Number(page)) || Number(quantityBooks) < 1 || Number(page) < 0) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/quantity/ and /page/ must be positive numbers!',
        },
      });
    }
    try {
      const getAllFavoriteBooks = await this.favoriteBooksUsecase.getAllFavoriteBooksByUserId(
        userId,
        Number(quantityBooks),
        Number(page)
      );
      return response
        .status(200)
        .send({ body: { status_code: 200, status: 'success', favorite_books: getAllFavoriteBooks } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async getFavoriteBooksById(request: Request, response: Response) {
    const { id: bookId } = request.params;
    try {
      const booksConsultedById = await this.favoriteBooksUsecase.getFavoriteBooksById(bookId);
      return response
        .status(200)
        .send({ body: { status_code: 200, status: 'success', favorite_books: booksConsultedById } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async getFavoriteBookByUserIdAndBookId(request: Request, response: Response) {
    const { book_id, owner_id } = request.params;
    try {
      const bookConsulted = await this.favoriteBooksUsecase.getFavoriteBookByUserIdAndBookId({
        book_id,
        owner_id,
      });
      const favoriteBooks = bookConsulted ? [bookConsulted] : [];
      return response.status(200).send({
        body: { status_code: 200, status: 'success', favorite_books: favoriteBooks },
      });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async createFavoriteBook(request: Request, response: Response) {
    const { owner_id: userIdbytoken } = response.locals;
    const { owner_id, book_id } = request.body;
    if (userIdbytoken !== owner_id) {
      return response.status(403).json({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'The user has no authorization for the action!',
        },
      });
    }
    try {
      const bookCreated = await this.favoriteBooksUsecase.createFavoriteBook({
        book_id,
        owner_id,
      });
      return response.status(201).json({ body: { status_code: 201, status: 'success', favorite_books: bookCreated } });
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
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async deleteFavoriteBook(request: Request, response: Response) {
    const { owner_id: userIdByToken } = response.locals;
    const { owner_id, book_id } = request.body;
    if (!book_id || !owner_id) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/book_id/ and /owner_id/ is required!',
        },
      });
    }
    if (userIdByToken !== owner_id) {
      return response.status(403).json({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'The user has no authorization for the action!',
        },
      });
    }
    const booksConsultedById = await this.favoriteBooksUsecase.getFavoriteBooksById(book_id);
    const findBookByOwnerId = booksConsultedById.find((book) => book.owner_id === owner_id);
    try {
      if (!findBookByOwnerId) {
        return response.status(403).json({
          body: {
            status_code: 403,
            status: 'fail',
            message: 'The user does not own the favorite book!',
          },
        });
      }
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }

    try {
      await this.favoriteBooksUsecase.deleteFavoriteBook({ book_id, owner_id });
      return response
        .status(200)
        .json({ body: { status_code: 200, status: 'success', message: 'Favorite book successfully deleted!' } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
}
