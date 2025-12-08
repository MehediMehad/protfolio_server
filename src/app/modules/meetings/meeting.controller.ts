import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { MeetingServices } from './meeting.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createMeeting = catchAsync(async (req: Request, res: Response) => {
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

const getAllMeetings = catchAsync(async (_req: Request, res: Response) => {
  const result = await MeetingServices.getAllMeetings();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meetings retrieved successfully',
    data: result,
  });
});

const acceptOrRejectMeeting = catchAsync(async (req: Request, res: Response) => {
  const meetingId = req.params.meetingId;
  const accepted = req.body.accepted;
  const result = await MeetingServices.acceptOrRejectMeeting(meetingId, accepted);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.result,
  });
});

export const MeetingControllers = {
  createMeeting,
  getAllMeetings,
  acceptOrRejectMeeting,
};
