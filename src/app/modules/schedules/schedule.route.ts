import express from 'express';
import auth from '../../middlewares/auth';
import { ScheduleControllers } from './schedule.controller';
import validateRequest from '../../middlewares/validateRequest';
import ScheduleValidations from './schedule.validation';

const router = express.Router();

// Create new schedule
router.post(
  '/',
  auth('ADMIN'),
  validateRequest(ScheduleValidations.createScheduleSchema),
  ScheduleControllers.createSchedule,
);

export const ScheduleRoutes = router;
