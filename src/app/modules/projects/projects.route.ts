import { Router } from 'express';
import { ProjectValidations } from './projects.validation';
import { ProjectControllers } from './projects.controller';
import { CloudinaryFileUploader } from '../../middlewares/cloudinaryMulterMiddleware';
import CloudinaryValidateRequest from '../../middlewares/cloudinaryValidateRequest';

const router = Router();

router.post(
    '/',
    // auth('ADMIN'),
    CloudinaryFileUploader.uploadFields,
    CloudinaryValidateRequest(ProjectValidations.createProjectSchema, {
        image: 'single',
    }),
    ProjectControllers.createProject,
);



export const ProjectRoutes = router;