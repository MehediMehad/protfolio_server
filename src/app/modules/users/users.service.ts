import type { Secret } from 'jsonwebtoken';

import authConfig from '../../configs/auth.config';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import prisma from '../../libs/prisma';

const createOrGetUser = async (payload: any) => {
  const { email, name, image, provider, providerId } = payload;
  console.log({ payload });

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

    // Generate an access token
    const accessToken = jwtHelpers.generateToken(
      {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      },
      authConfig.jwt.access_secret as Secret,
      authConfig.jwt.access_expires_in,
    );
    console.log({ accessToken });

    return { ...createdUser, accessToken };
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

  // Generate an access token
  const accessToken = jwtHelpers.generateToken(
    {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    },
    authConfig.jwt.access_secret as Secret,
    authConfig.jwt.access_expires_in,
  );
  console.log({ accessToken });
  return { ...updatedUser, accessToken };
};

export const UsersServices = {
  createOrGetUser,
};
