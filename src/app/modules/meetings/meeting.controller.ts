import httpStatus from 'http-status';

import { MeetingServices } from './meeting.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createMeeting = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const body = req.body;
  const result = await MeetingServices.createMeeting(userId, body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Meeting created successfully',
    data: result,
  });
});

const getAllMeetings = catchAsync(async (req, res) => {
  const result = await MeetingServices.getAllMeetings();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meetings retrieved successfully',
    data: result,
  });
});

export const MeetingControllers = {
  createMeeting,
  getAllMeetings,
};
