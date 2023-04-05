import express from 'express';
import profiles from '../mocks/profiles';
import OAuth from '../models/OAuth';

export default class ProfileController {
  static authenticateProfile(req: express.Request, res: express.Response) {
    const { user_name, password }: { user_name: string; password: string } = req.body;
    if (!user_name || !password) {
      return res.status(401).send({
        status: 401,
        body: {
          message: 'User name and password profile id are required!',
        },
      });
    }

    const foundProfileIndex = profiles.findIndex(
      (profile) => profile.user_name === user_name && profile.password === password
    );

    if (foundProfileIndex === -1) {
      return res.status(401).send({
        status: 401,
        body: {
          message: 'Incorrect username or password!',
        },
      });
    }

    try {
      const tokenByProfile: string = OAuth.createToken({
        id: profiles[foundProfileIndex].id,
        user_name: profiles[foundProfileIndex].user_name,
      });

      profiles[foundProfileIndex].authorizations.push(tokenByProfile);
      return res.status(202).send({ status: 202, body: { authorization: tokenByProfile } });
    } catch (error) {
      res.status(400).send({ status: 400, message: error });
    }
  }

  static listProfiles(req: express.Request, res: express.Response) {
    const authorizationProfile = req.headers.authorization as string | undefined;

    if (!authorizationProfile) {
      return res.status(400).send({
        status: 401,
        body: {
          message: 'authorizationProfile is required!',
        },
      });
    }

    try {
      const decryptedToken = OAuth.verifyToken(authorizationProfile) as {
        id: string;
        user_name: string;
      };

      const foundProfileByToken = profiles.find(
        (profile) => profile.id === decryptedToken.id && profile.user_name == decryptedToken.user_name
      );

      if (!foundProfileByToken) {
        return res.status(401).send({
          status: 401,
          body: { message: 'Profile not found!' },
        });
      }

      const { authorizations: tokensProfile }: { authorizations: string[] } = foundProfileByToken;

      const isValidToken = tokensProfile.some((token) => token == authorizationProfile);

      if (!isValidToken) {
        return res.status(401).send({
          status: 401,
          body: {
            message: 'The token is not valid to perform operations!',
          },
        });
      }

      return res.status(200).json({ status: 200, body: { message: 'ok', profiles: profiles } });
    } catch (error) {
      res.status(400).send({ status: 400, body: { message: error } });
    }
  }
}