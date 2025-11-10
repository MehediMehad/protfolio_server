import express from 'express';

import { AuthControllers } from './auth.controller';
import { authValidation } from './auth.validation';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();

export const AuthRouters = router;
