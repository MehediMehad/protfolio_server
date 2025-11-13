import type { CreateMeetingSchema } from './meeting.interface';
import { createZoomMeeting } from './meeting.utils';
import prisma from '../../libs/prisma';

const createMeeting = async (userId: string, payload: CreateMeetingSchema) => {
  const { scheduleId, title, description, platform } = payload;

  // 1. Check slot availability
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule || schedule.isBooked) {
    throw new Error('Slot is not available');
  }

  const duration = Math.round((schedule.endTime.getTime() - schedule.startTime.getTime()) / 60000);

  // 2. Create Zoom meeting
  let link = '';
  if (platform === 'zoom') {
    const zoom = await createZoomMeeting({
      topic: title,
      start_time: schedule.startTime.toISOString(),
      duration,
    });
    link = zoom.join_url;
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

  return result;
};

export const MeetingServices = {
  createMeeting,
};
