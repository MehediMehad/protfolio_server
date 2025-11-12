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
