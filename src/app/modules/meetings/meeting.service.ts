import type { CreateMeetingSchema } from './meeting.interface';
import { createGoogleCalenderEvent, createZoomMeetingLink } from './meeting.utils';
import prisma from '../../libs/prisma';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import config from '../../configs';
import { timeToMinutes } from './meeting.validation';

const createMeeting = async (userId: string, payload: CreateMeetingSchema) => {
  const { date, startTime, endTime, title, description, platform } = payload;
  const duration = timeToMinutes(endTime) - timeToMinutes(startTime);

  // 2. Create Zoom meeting
  let link = config.Google.meeting_link!; // Manual For(FREE)
  if (platform === 'zoom') {
    const zoomMeetingLink = await createZoomMeetingLink({
      topic: title,
      start_time: `${date}T${startTime}`,  // YYYY-MM-DDTHH:mm
      duration,
    });
    link = zoomMeetingLink;
  }

  // 3. Create meeting in DB
  const meeting = await prisma.meeting.create({
    data: {
      title,
      description,
      startTime: `${date}T${startTime}`,
      endTime: `${date}T${endTime}`,
      platform,
      link,
      userId,
    },
  });

  // 4. create google calender event
  await createGoogleCalenderEvent({
    title,
    description,
    startTime: `${date}T${startTime}`,
    endTime: `${date}T${endTime}`,
    meetingLink: link!,
  });

  return meeting;
};



export const MeetingServices = {
  createMeeting,
};
