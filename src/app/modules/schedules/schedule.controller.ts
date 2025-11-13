import httpStatus from 'http-status';

import { ScheduleServices } from './schedule.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleServices.createSchedule(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Schedule created successfully',
    data: result,
  });
});


const getAvailable = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleServices.getAvailableSchedules();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

export const ScheduleControllers = {
  createSchedule,
  getAvailable
};
