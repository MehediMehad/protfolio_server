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
    return createdUser;
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

  return updatedUser;
};

export const UsersServices = {
  createOrGetUser,
};
