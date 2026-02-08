import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProjectServices } from './projects.service';

const createProject = catchAsync(async (req: Request, res: Response) => {
    const body = req.body;
    const result = await ProjectServices.createProject(body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Project created successfully',
        data: result,
    });
});

const getFeaturedProjects = catchAsync(async (_req: Request, res: Response) => {
    const result = await ProjectServices.getFeaturedProjects();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Projects retrieved successfully',
        data: result,
    });
});

export const ProjectControllers = {
    createProject,
    getFeaturedProjects
};