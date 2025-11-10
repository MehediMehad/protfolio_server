// import { Request, Response } from 'express';
// import prisma from '../../libs/prisma';

// export const createOrGetUser = async (req: Request, res: Response) => {
//   const { email, name, provider, providerId } = req.body;

//   console.log({ email, name, provider, providerId });

//   try {
//     // ইমেইল দিয়ে খুঁজি
//     let user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       // নতুন ইউজার তৈরি
//       user = await prisma.user.create({
//         data: {
//           email,
//           name,
//           provider,
//           providerId,
//         },
//       });
//       return res.status(201).json({ message: 'নতুন ইউজার তৈরি হয়েছে', user });
//     }

//     return res.status(200).json({ message: 'ইউজার আগে থেকেই আছে', user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'সার্ভারে সমস্যা' });
//   }
// };

import httpStatus from 'http-status';

import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UsersServices } from './users.service';

const createOrGetUser = catchAsync(async (req, res) => {
  const result = await UsersServices.createOrGetUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created or retrieved successfully',
    data: result,
  });
});

export const UsersControllers = { createOrGetUser };
