import httpStatus from 'http-status';

import type { CreateMeetingSchema } from './meeting.interface';
import { createGoogleCalenderEvent, createZoomMeetingLink } from './meeting.utils';
import { timeToMinutes } from './meeting.validation';
import config from '../../configs';
import ApiError from '../../errors/ApiError';
import prisma from '../../libs/prisma';

const createMeeting = async (userId: string, payload: CreateMeetingSchema) => {
  const { date, startTime, endTime, title, description, platform, agenda } = payload;
  const duration = timeToMinutes(endTime) - timeToMinutes(startTime);
  const pureDate = date.split('T')[0];
  const dbStartTime = new Date(`${pureDate}T${startTime}:00`).toISOString();
  const dbEndTime = new Date(`${pureDate}T${endTime}:00`).toISOString();

  // 2. Create Zoom meeting
  let link = config.Google.meeting_link!; // Manual For(FREE)
  if (platform === 'zoom') {
    const zoomMeetingLink = await createZoomMeetingLink({
      topic: title,
      start_time: dbStartTime, // YYYY-MM-DDTHH:mm
      duration,
    });
    link = zoomMeetingLink;
  }

  // 3. Create meeting in DB
  const meeting = await prisma.meeting.create({
    data: {
      title,
      description,
      startTime: dbStartTime,
      endTime: dbEndTime,
      platform,
      link,
      userId,
      agenda,
    },
  });

  // 4. create google calender event
  await createGoogleCalenderEvent({
    title,
    description,
    startTime: dbStartTime,
    endTime: dbEndTime,
    meetingLink: link!,
  });

  return meeting;
};

const getAllMeetings = async () => {
  const result = await prisma.meeting.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      platform: true,
      link: true,
      status: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return result;
};

const acceptOrRejectMeeting = async (meetingId: string, accepted: boolean) => {
  // find meeting
  const meeting = await prisma.meeting.findUnique({
    where: {
      id: meetingId,
    },
    select: { startTime: true, status: true },
  });

  // check if meeting exists
  if (!meeting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meeting not found');
  }

  // check if meeting has passed
  const now = new Date();
  if (meeting.startTime < now) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Meeting has already passed');
  }

  // check if meeting has been accepted
  if (meeting.status === 'ACCEPTED' && !accepted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Meeting has already been accepted');
  }

  // check if meeting has been rejected
  if (meeting.status === 'REJECTED' && accepted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Meeting has already been rejected');
  }

  const result = await prisma.meeting.update({
    where: {
      id: meetingId,
    },
    data: {
      status: accepted ? 'ACCEPTED' : 'REJECTED',
    },
  });

  return {
    result,
    message: `Meeting ${accepted ? 'accepted' : 'rejected'} successfully`,
  };
};

export const MeetingServices = {
  createMeeting,
  getAllMeetings,
  acceptOrRejectMeeting,
};
