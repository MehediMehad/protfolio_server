import express from 'express';

import { ScheduleControllers } from './schedule.controller';
import ScheduleValidations from './schedule.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Create new schedule
router.post(
  '/',
  auth('ADMIN'),
  validateRequest(ScheduleValidations.createScheduleSchema),
  ScheduleControllers.createSchedule,
);

export const ScheduleRoutes = router;
