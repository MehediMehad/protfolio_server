import z from 'zod';
import { createScheduleSchema } from '../schedules/schedule.validation';

// Interface
export type CreateScheduleSchema = z.infer<typeof createScheduleSchema>;
