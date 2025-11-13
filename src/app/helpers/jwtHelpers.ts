import type { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import authConfig from '../configs/auth.config';

export interface TAuthPayload {
  userId: string;
  email: string;
  role: string;
}

const verifyToken = (token: string, secret: Secret) => jwt.verify(token, secret) as JwtPayload;

const generateToken = (payload: TAuthPayload, secret: Secret, expiresIn: string) => {
  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn,
  } as jwt.SignOptions;
  const token = jwt.sign(payload, secret, options);
  return token;
};

const generateAuthTokens = (
  data: TAuthPayload,
): {
  accessToken: string;
  refreshToken: string;
} => {
  // Access Token generate
  const accessToken = generateToken(
    data,
    authConfig.jwt.access_secret,
    authConfig.jwt.access_expires_in,
  );

  // Refresh Token generate
  const refreshToken = generateToken(
    data,
    authConfig.jwt.refresh_secret,
    authConfig.jwt.refresh_expires_in,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const jwtHelpers = {
  verifyToken,
  generateAuthTokens,
};
