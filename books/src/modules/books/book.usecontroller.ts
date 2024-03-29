import { Request, Response } from 'express';
import { BookUsecase } from './book.usecase.js';
import { ZodError } from 'zod';

export class BookController {
  private bookUseCase = new BookUsecase();
  constructor() {}

  public async getAllBooks(request: Request, response: Response) {
    const { allbooks: allBooks = false } = request.params;
    const { quantity: quantityBooks = 10, page = 0, name: searchName, author: searchAuthor } = request.query;
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
      const booksConsulted = await this.bookUseCase.getAllBooks(
        !!allBooks,
        Number(quantityBooks),
        Number(page),
        searchName && String(searchName),
        searchAuthor && String(searchAuthor)
      );
      return response.status(200).send({ body: { status_code: 200, status: 'success', books: booksConsulted } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async getBookById(request: Request, response: Response) {
    const { id: bookId } = request.params;
    try {
      const booksConsultedById = await this.bookUseCase.getBookById(bookId);
      return booksConsultedById
        ? response.status(200).send({ body: { status_code: 200, status: 'success', books: booksConsultedById } })
        : response
            .status(404)
            .send({ body: { status_code: 404, status: 'fail', message: 'User not found by the id provided!' } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async getBooksByUserId(request: Request, response: Response) {
    const { allbooks: allBooks = false } = request.params;
    const { quantity: quantityBooks = 10, page = 0 } = request.query;
    const { id: userId } = request.params;
    if ((quantityBooks !== null && Number(quantityBooks) < 1) || (page !== null && Number(page) < 0)) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/quantity/ and /page/ must be positive numbers!',
        },
      });
    }
    try {
      const booksConsultedById = await this.bookUseCase.getBooksByUserId(
        !!allBooks,
        userId,
        Number(quantityBooks),
        Number(page)
      );
      return booksConsultedById
        ? response.status(200).send({ body: { status_code: 200, status: 'success', books: booksConsultedById } })
        : response
            .status(404)
            .send({ body: { status_code: 404, status: 'fail', message: 'User not found by the id provided!' } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async createBook(request: Request, response: Response) {
    const { owner_id } = response.locals;
    const { name, author, description, photo, is_read = false, rate = null } = request.body;
    if (rate !== null && (Number(rate) < 1 || Number(rate) > 5)) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: 'The /rate/ must be between 1 and 5!',
        },
      });
    }
    try {
      const bookCreated = await this.bookUseCase.createBook({
        name,
        author,
        description,
        photo,
        is_changed: false,
        is_read,
        is_deleted: false,
        rate,
        owner_id,
      });
      return response.status(201).json({ body: { status_code: 201, status: 'success', books: bookCreated } });
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
  public async updateBook(request: Request, response: Response) {
    const { owner_id } = response.locals;
    const { id: bookId } = request.params;
    const { name, author, description, photo, is_changed, is_read, is_deleted, rate } = request.body;
    if (!bookId) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/bookid/ is required!',
        },
      });
    }
    if (rate !== null && (Number(rate) < 1 || Number(rate) > 5)) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: 'The /rate/ must be between 1 and 5',
        },
      });
    }
    try {
      const bookConsultedById = await this.bookUseCase.getBookById(bookId);
      if (bookConsultedById?.owner_id !== owner_id) {
        return response.status(403).json({
          body: {
            status_code: 403,
            status: 'fail',
            message: 'The user does not own the book!',
          },
        });
      }
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
    try {
      const updatebook = await this.bookUseCase.updateBook(bookId, {
        name,
        author,
        description,
        photo,
        is_changed,
        is_read,
        is_deleted,
        rate,
      });
      return response.status(200).json({
        body: {
          status_code: 200,
          status: 'success',
          books: updatebook,
        },
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
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async deleteBook(request: Request, response: Response) {
    const { owner_id } = response.locals;
    const { id: bookId } = request.params;
    if (!bookId) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/bookid/ is required!',
        },
      });
    }
    try {
      const bookConsultedById = await this.bookUseCase.getBookById(bookId);
      if (bookConsultedById?.owner_id !== owner_id) {
        return response.status(403).json({
          body: {
            status_code: 403,
            status: 'fail',
            message: 'The user does not own the book!',
          },
        });
      }
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }

    try {
      await this.bookUseCase.deleteBook(bookId);
      return response
        .status(200)
        .json({ body: { status_code: 200, status: 'success', message: 'Book successfully deleted!' } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
}
