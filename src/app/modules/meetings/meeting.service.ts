import httpStatus from 'http-status';

import type { CreateMeetingSchema } from './meeting.interface';
import { createGoogleCalenderEvent, createZoomMeetingLink } from './meeting.utils';
import { timeToMinutes } from './meeting.validation';
import config from '../../configs';
import prisma from '../../libs/prisma';

const createMeeting = async (userId: string, payload: CreateMeetingSchema) => {
  const { date, startTime, endTime, title, description, platform, agenda } = payload;
  const duration = timeToMinutes(endTime) - timeToMinutes(startTime);
  const pureDate = date.split("T")[0];
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
      agenda
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
      accepted: true,
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

export const MeetingServices = {
  createMeeting,
  getAllMeetings,
};
