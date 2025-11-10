import { Router } from 'express';

import { UsersValidations } from './users.validation';
import { fileUploader } from '../../middlewares/s3MulterMiddleware';
import validateRequest from '../../middlewares/validateRequest';
import { UsersControllers } from './users.controller';

const router = Router();

router.post('/', UsersControllers.createOrGetUser);

export const UsersRoutes = router;
