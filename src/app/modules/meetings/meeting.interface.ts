import z from "zod";
import { createMeetingSchema } from "./meeting.validation";


export type CreateMeetingSchema = z.infer<typeof createMeetingSchema>;