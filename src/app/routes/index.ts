import express from 'express';

import { AuthRouters } from '../modules/auth/auth.route';
import { ChatRoutes } from '../modules/chat/chat.Routes';
import { UsersRoutes } from '../modules/users/users.route';

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
