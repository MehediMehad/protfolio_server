import express from 'express';

import { MeetingControllers } from './meeting.controller';
import { MeetingValidations } from './meeting.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Create new meeting
router.post(
  '/',
  auth('USER'),
  validateRequest(MeetingValidations.createMeetingSchema),
  MeetingControllers.createMeeting,
);

router.get('/', MeetingControllers.getAllMeetings); // TODO: ADD: auth(USER, ADMIN)

router.put(
  '/:meetingId',
  auth('ADMIN'),
  validateRequest(MeetingValidations.acceptOrRejectMeetingSchema),
  MeetingControllers.acceptOrRejectMeeting,
);

export const MeetingRoutes = router;
