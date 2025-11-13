import express from 'express';

import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MeetingValidations } from './meeting.validation';
import { MeetingControllers } from './meeting.controller';

const router = express.Router();

// Create new meeting 
router.post(
    '/',
    auth('USER'),
    validateRequest(MeetingValidations.bookMeetingSchema),
    MeetingControllers.bookMeeting,
);


export const ScheduleRoutes = router;
