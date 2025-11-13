import type { JoinedProviderEnum } from '@prisma/client';

import type { TAuthPayload } from '../../helpers/jwtHelpers';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import prisma from '../../libs/prisma';

type TPayload = {
  email: string;
  name: string;
  image: string;
  provider: JoinedProviderEnum;
  providerId: string;
};

const createOrGetUser = async (payload: TPayload) => {
  const { email, name, image, provider, providerId } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const createdUser = await prisma.user.create({
      data: {
        email,
        name,
        image,
        provider,
        providerId,
      },
    });

    const data: TAuthPayload = {
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    };

    // Generate an access token
    const accessToken = jwtHelpers.generateAuthTokens(data);
    const refreshToken = jwtHelpers.generateAuthTokens(data);

    console.log({ accessToken, refreshToken });

    return { ...createdUser, accessToken, refreshToken };
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      name,
      image,
      provider,
      providerId,
    },
  });

  const data: TAuthPayload = {
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
  };

  // Generate an access token
  const accessToken = jwtHelpers.generateAuthTokens(data).accessToken;
  const refreshToken = jwtHelpers.generateAuthTokens(data).refreshToken;

  console.log({ accessToken, refreshToken });
  return { ...updatedUser, accessToken, refreshToken };
};

export const UsersServices = {
  createOrGetUser,
};
