import { Router } from 'express';

import { UsersControllers } from './users.controller';

const router = Router();

router.post('/', UsersControllers.createOrGetUser);

export const UsersRoutes = router;
