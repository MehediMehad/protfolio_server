import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { ScheduleServices } from './schedule.service';

const createSchedule = catchAsync(async (req, res) => {
  const result = await ScheduleServices.createSchedule(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Schedule created successfully',
    data: result,
  });
});

export const ScheduleControllers = {
  createSchedule,
};
