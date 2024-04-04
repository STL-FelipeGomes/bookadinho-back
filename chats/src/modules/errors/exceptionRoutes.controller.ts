import { Request, Response } from 'express';

export class ExceptionRoutesController {
  public routeNotFound(request: Request, response: Response) {
    return response.status(404).json({
      body: {
        status_code: 404,
        status: 'fail',
        message: 'Route not found!',
      },
    });
  }

  public routeRoot(request: Request, response: Response) {
    return response.status(200).json({
      body: {
        status_code: 200,
        status: 'success',
        info: {
          welcome: 'Welcome the Bookadinho!',
          message:
            'Bookadinho is a social network that aims to encourage readers to share their ideas and perhaps their books.',
          url_project: 'https://github.com/felp-gomes/back-end-bookadinho',
          Members: [
            {
              name: 'Felp Gomes',
              github: 'https://github.com/felp-gomes',
            },
            {
              name: 'Paula Cynthia',
              github: 'https://github.com/paulacynthia',
            },
          ],
        },
      },
    });
  }
}
