import type { CreateMeetingSchema } from './meeting.interface';
import { createGoogleCalenderEvent, createZoomMeetingLink } from './meeting.utils';
import prisma from '../../libs/prisma';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import config from '../../configs';

const createMeeting = async (userId: string, payload: CreateMeetingSchema) => {
  const { scheduleId, title, description, platform } = payload;

  // 1. Check slot availability
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule || schedule.isBooked) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot is not available');
  }
  const duration = Math.round((schedule.endTime.getTime() - schedule.startTime.getTime()) / 60000);

  // 2. Create Zoom meeting
  let link: string;
  if (platform === 'zoom') {
    const zoomMeetingLink = await createZoomMeetingLink({
      topic: title,
      start_time: schedule.startTime.toISOString(),
      duration,
    });
    link = zoomMeetingLink;
  }

  // 2. Create Google Meet event
  if (platform === 'google_meet') {
    const MEET_LINK = config.Google.meeting_link!; // Manual For(FREE)
    link = MEET_LINK;
  }

  // 3. Create meeting in DB
  const result = await prisma.$transaction(async (tx) => {
    const meeting = await tx.meeting.create({
      data: {
        title,
        description,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        platform,
        link,
        userId,
        scheduleId,
      },
    });

    await tx.schedule.update({
      where: { id: scheduleId },
      data: { isBooked: true },
    });

    return meeting;
  });

  // 4. create google calender event
  await createGoogleCalenderEvent({
    title,
    description,
    startTime: schedule.startTime.toISOString(),
    endTime: schedule.endTime.toISOString(),
    meetingLink: link!,
  });
  return result;
};

export const MeetingServices = {
  createMeeting,
};
