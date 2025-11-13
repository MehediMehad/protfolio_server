import type { CreateScheduleSchema } from './schedule.interface';
import { parseDateTime } from './schedule.utils';
import prisma from '../../libs/prisma';

const createSchedule = async (payload: CreateScheduleSchema, adminId: string) => {
  const { date, startTime, endTime } = payload;


  console.log({ payload });

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

const getAvailableSchedules = async () => {
  const available = await prisma.schedule.findMany({
    where: {
      isBooked: false,
      date: { gte: new Date() }, // past slots বাদ
    },
    orderBy: { date: 'asc' },
    select: {
      id: true,
      admin: true,
      date: true,
      startTime: true,
      endTime: true,
      isBooked: true
    }
  });

  return available
};

export const ScheduleServices = {
  createSchedule,
  getAvailableSchedules
};
