import { MeetingPlatformEnum, AgendaEnum } from '@prisma/client';
import z from 'zod';

// Time must be in HH:MM format, where MM = 00 or 30
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):(00||30)$/, 'Time must be in HH:MM format and minutes must be 00 or 30');

// Function to convert HH:MM to minutes for easy comparison
export const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

export const createMeetingSchema = z
  .object({
    date: z.string().datetime({ message: 'Invalid date format' }),
    startTime: timeSchema,
    endTime: timeSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    platform: z.enum(MeetingPlatformEnum),
    agenda: z.enum(AgendaEnum),
  })
  .refine((data) => timeToMinutes(data.startTime) < timeToMinutes(data.endTime), {
    message: 'endTime must be greater than startTime',
    path: ['endTime'], // error will point to endTime
  });

export const acceptOrRejectMeetingSchema = z.object({
  accepted: z.boolean(),
});

export const MeetingValidations = {
  createMeetingSchema,
  acceptOrRejectMeetingSchema,
};
