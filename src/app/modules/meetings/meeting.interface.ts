import type z from 'zod';

import type { createMeetingSchema } from './meeting.validation';

export type CreateMeetingSchema = z.infer<typeof createMeetingSchema>;
