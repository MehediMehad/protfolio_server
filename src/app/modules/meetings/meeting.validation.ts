import { MeetingPlatformEnum } from '@prisma/client';
import z from 'zod';

import { objectIdRegex } from '../schedules/schedule.validation';

export const createMeetingSchema = z.object({
  scheduleId: z.string().regex(objectIdRegex),
  title: z.string().min(1),
  description: z.string().optional(),
  platform: z.enum(MeetingPlatformEnum),
});

export const MeetingValidations = {
  createMeetingSchema,
};
