import express from 'express';

import { AuthRouters } from '../modules/auth/auth.route';
import { UsersRoutes } from '../modules/users/users.route';
import { ScheduleRoutes } from '../modules/schedules/schedule.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
  {
    path: '/users',
    route: UsersRoutes,
  },
  {
    path: '/schedules',
    route: ScheduleRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
