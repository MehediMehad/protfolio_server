import express from 'express';

import { MeetingRoutes } from '../modules/meetings/meeting.route';
import { UsersRoutes } from '../modules/users/users.route';
import { ProjectRoutes } from '../modules/projects/projects.route';

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
  {
    path: '/project',
    route: ProjectRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
