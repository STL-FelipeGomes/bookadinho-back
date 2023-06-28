import { Request, Response } from 'express';
import books from '../mocks/books';
import { ProfileInterface } from '../interfaces/profile';
import { BookInterface } from '../interfaces/book';

export default class BookController {
  static listBooks(req: Request, res: Response) {
    const booksNoChange = books.filter(({ is_change }) => is_change === false);
    return res.status(202).send({ body: { status_code: 202, status: 'sucess', books: booksNoChange } });
  }
  static listBookById(req: Request, res: Response) {
    const idBook = req.params.id;
    const bookById = books.find((book) => book.id === idBook);
    return bookById
      ? res.status(202).send({ body: { status_code: 202, status: 'sucess', book: bookById } })
      : res.status(404).send({ body: { status_code: 404, status: 'sucess', message: 'Not found book by id!' } });
  }
  static createBook(req: Request, res: Response) {
    const foundProfileByToken: ProfileInterface = res.locals.foundProfileByToken;
    const { name, author, description, photo, is_read } = req.body;
    if (!name || !author || !description || typeof is_read !== 'boolean') {
      return res.status(403).send({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'Name, author, description, photo and read if required!',
        },
      });
    }
    if (name.length > 256) {
      return res.status(403).send({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'Name must be less than 256 characters!',
        },
      });
    }
    if (author.length > 256) {
      return res.status(403).send({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'Author must be less than 256 characters!',
        },
      });
    }
    if (description.length > 256) {
      return res.status(403).send({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'Description must be less than 256 characters!',
        },
      });
    }
    const newBook: BookInterface = {
      id: `${books.length + 1}`,
      name: name.trim(),
      author: author.trim(),
      description: description.trim(),
      photo: photo.trim(),
      is_read,
      is_change: false,
      profile: {
        id: foundProfileByToken.id,
        user_name: foundProfileByToken.user_name,
      },
    };
    books.push(newBook);
    return res.status(201).send({ body: { status_code: 201, status: 'sucess', book: newBook } });
  }
  static editBook(req: Request, res: Response) {
    const bookEditId: string = req.params.id;
    const { name, author, description, photo } = req.body;
    if (name && (name.length < 1 || name.length > 256)) {
      return res.status(403).send({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'Name must be less than 256 characters!',
        },
      });
    }
    if (author && (author.length < 1 || author.length > 256)) {
      return res.status(403).send({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'Author must be less than 256 characters!',
        },
      });
    }
    if (description && (description.length < 1 || description.length > 256)) {
      return res.status(403).send({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'Description must be less than 256 characters!',
        },
      });
    }
    if (photo && photo.length < 1) {
      return res.status(403).send({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'Description must be down than 0 characters!',
        },
      });
    }
    if (!name && !author && !description && !photo) {
      return res.status(403).send({
        body: {
          status_code: 403,
          status: 'fail',
          message: 'Someone name, author, description, photo and read if required!',
        },
      });
    }
    const foundBookIndex = books.findIndex(({ id }) => id === bookEditId);
    if (foundBookIndex === -1) {
      return res.status(404).send({
        body: {
          status_code: 404,
          status: 'fail',
          message: 'Book id not found!',
        },
      });
    }
    const updatedBook: BookInterface = {
      ...books[foundBookIndex],
      name: name ? name.trim() : books[foundBookIndex].name,
      author: author ? author.trim() : books[foundBookIndex].author,
      description: description ? description.trim() : books[foundBookIndex].description,
      photo: photo ? photo.trim() : books[foundBookIndex].photo,
    };
    books[foundBookIndex] = updatedBook;
    return res.status(201).send({ body: { status_code: 201, status: 'sucess', book: updatedBook } });
  }
  static readBook(req: Request, res: Response) {
    const bookEditId: string = req.params.id;
    const foundBookIndex = books.findIndex(({ id }) => id === bookEditId);
    if (foundBookIndex === -1) {
      return res.status(404).send({
        body: {
          status_code: 404,
          status: 'fail',
          message: 'Book id not found!',
        },
      });
    }
    if (books[foundBookIndex].is_read) {
      return res.status(304).send({
        body: {
          status_code: 304,
          status: 'fail',
          message: 'Book is already marked as read!',
        },
      });
    }
    books[foundBookIndex].is_read = true;
    return res.status(201).send({ body: { status_code: 201, status: 'sucess', book: books[foundBookIndex] } });
  }
  static changeBook(req: Request, res: Response) {
    const bookEditId: string = req.params.id;
    const foundBookIndex = books.findIndex(({ id }) => id === bookEditId);
    if (foundBookIndex === -1) {
      return res.status(404).send({
        body: {
          status_code: 404,
          status: 'fail',
          message: 'Book id not found!',
        },
      });
    }
    if (books[foundBookIndex].is_change) {
      return res.status(304).send({
        body: {
          status_code: 304,
          status: 'fail',
          message: 'Book has already been changed!',
        },
      });
    }
    books[foundBookIndex].is_change = true;
    return res.status(201).send({ body: { status_code: 201, status: 'sucess', book: books[foundBookIndex] } });
  }
}
