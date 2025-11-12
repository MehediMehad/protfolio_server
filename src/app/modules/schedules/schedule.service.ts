import prisma from '../../libs/prisma';
import { CreateScheduleSchema } from './schedule.interface';
import { parseDateTime } from './schedule.utils';

const createSchedule = async (payload: CreateScheduleSchema) => {
  const { adminId, date, startTime, endTime } = payload;

  const schedule = await prisma.schedule.create({
    data: {
      adminId,
      date: new Date(date),
      endTime: parseDateTime(date, endTime),
      startTime: parseDateTime(date, startTime),
    },
  });
  return schedule;
};

export const ScheduleServices = {
  createSchedule,
};
