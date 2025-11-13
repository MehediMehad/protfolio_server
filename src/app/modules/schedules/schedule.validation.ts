import { z } from 'zod';

// Regex for validating a MongoDB ObjectId (24 hex characters)
export const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Time must be in HH:MM format, where MM = 00 or 30
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):(30)$/, 'Time must be in HH:MM format and minutes must be 00 or 30');

// Function to convert HH:MM to minutes for easy comparison
const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

export const createScheduleSchema = z
  .object({
    adminId: z.string().regex(objectIdRegex, 'Invalid admin ID'),
    date: z.string().datetime({ message: 'Invalid date format' }),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((data) => timeToMinutes(data.startTime) < timeToMinutes(data.endTime), {
    message: 'endTime must be greater than startTime',
    path: ['endTime'], // error will point to endTime
  });

const ScheduleValidations = {
  createScheduleSchema,
};

export default ScheduleValidations;
