import type z from 'zod';

import type { createScheduleSchema } from '../schedules/schedule.validation';

// Interface
export type CreateScheduleSchema = z.infer<typeof createScheduleSchema>;
