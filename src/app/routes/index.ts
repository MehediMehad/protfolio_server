import express from 'express';

import { MeetingRoutes } from '../modules/meetings/meeting.route';
import { UsersRoutes } from '../modules/users/users.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UsersRoutes,
  },
  {
    path: '/meeting',
    route: MeetingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
