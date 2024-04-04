import { Request, Response } from 'express';
import { PostUsercase } from './post.usecase.js';
import { ZodError } from 'zod';

export class PostController {
  private postUsercase = new PostUsercase();
  constructor() {}

  public async getAllPosts(request: Request, response: Response) {
    const { quantity: quantityPosts = 10, page = 0 } = request.query;
    const { allposts: allPosts = false } = request.params;
    if (isNaN(Number(quantityPosts)) || isNaN(Number(page)) || Number(quantityPosts) < 1 || Number(page) < 0) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/quantity/ and /page/ must be positive numbers!',
        },
      });
    }
    try {
      const postsConsulted = await this.postUsercase.getAllPosts(!!allPosts, Number(quantityPosts), Number(page));
      return response.status(200).send({ body: { status_code: 200, status: 'success', posts: postsConsulted } });
    } catch (error) {
      response.status(500).send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
    return response.status(200).json('parabens');
  }
  public async getPostById(request: Request, response: Response) {
    const { id: postId } = request.params;
    try {
      const postConsultedById = await this.postUsercase.getPostById(postId);
      return postConsultedById
        ? response.status(200).send({ body: { status_code: 200, status: 'success', posts: postConsultedById } })
        : response
            .status(404)
            .send({ body: { status_code: 404, status: 'fail', message: 'Post not found by the id provided!' } });
    } catch (error) {
      response.status(500).send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async getPostByUserId(request: Request, response: Response) {
    const { quantity: quantityPosts = 10, page = 0 } = request.query;
    const { id: userId, allposts: allPosts = false } = request.params;
    if (!userId) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/userid/ is required!',
        },
      });
    }
    if (isNaN(Number(quantityPosts)) || isNaN(Number(page)) || Number(quantityPosts) < 1 || Number(page) < 0) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/quantity/ and /page/ must be positive numbers!',
        },
      });
    }
    try {
      const postsConsultedByUserId = await this.postUsercase.getPostByUserId(
        !!allPosts,
        userId,
        Number(quantityPosts),
        Number(page)
      );
      return postsConsultedByUserId.length !== 0
        ? response.status(200).send({ body: { status_code: 200, status: 'success', posts: postsConsultedByUserId } })
        : response
            .status(404)
            .send({ body: { status_code: 404, status: 'fail', message: 'User not found by the id provided!' } });
    } catch (error) {
      return response
        .status(500)
        .send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async createPost(request: Request, response: Response) {
    const { user_id } = response.locals;
    const { text = '' } = request.body;
    if (!text) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: 'The /text/ must be between 1 and 5!',
        },
      });
    }
    try {
      const createdPost = await this.postUsercase.createPost({ user_id, text });
      return response.status(201).json({ body: { status_code: 201, status: 'success', posts: createdPost } });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'ERR:DATABASE:0001') {
        return response.status(400).send({
          body: { status_code: 400, status: 'fail', message: error.cause },
        });
      }
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
  public async updatePost(request: Request, response: Response) {
    const { user_id: userId } = response.locals;
    const { id: postId } = request.params;
    const { text: newText } = request.body;
    if (!postId || !newText) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/postId/ and /newText/ is required!',
        },
      });
    }
    try {
      if ((await this.postUsercase.getPostById(postId))?.user_id !== userId) {
        return response.status(403).json({
          body: {
            status_code: 403,
            status: 'fail',
            message: 'The user does not own the post!',
          },
        });
      }
    } catch (error) {
      response.status(500).send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
    try {
      const postEdited = await this.postUsercase.updatePost(postId, { text: newText, user_id: userId });
      return response.status(200).json({
        body: {
          status_code: 200,
          status: 'success',
          posts: postEdited,
        },
      });
    } catch (error) {
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
      response.status(500).send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
  public async deletePost(request: Request, response: Response) {
    const { user_id: userId } = response.locals;
    const { id: postId } = request.params;
    if (!postId) {
      return response.status(400).json({
        body: {
          status_code: 400,
          status: 'fail',
          message: '/postId/ is required!',
        },
      });
    }
    try {
      if ((await this.postUsercase.getPostById(postId))?.user_id !== userId) {
        return response.status(403).json({
          body: {
            status_code: 403,
            status: 'fail',
            message: 'The user does not own the post!',
          },
        });
      }
    } catch (error) {
      response.status(500).send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
    try {
      await this.postUsercase.deletePost(postId);
      return response
        .status(200)
        .json({ body: { status_code: 200, status: 'success', message: 'Post successfully deleted!' } });
    } catch (error) {
      response.status(500).send({ body: { status_code: 500, status: 'fail', message: 'Internal Server Error!' } });
    }
  }
}
