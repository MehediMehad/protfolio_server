import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BlogServices } from './blogs.service';

const createBlog = catchAsync(async (req: Request, res: Response) => {
    const body = req.body;
    const result = await BlogServices.createBlog(body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Blog created successfully',
        data: result,
    });
});


export const BlogControllers = {
    createBlog,
};
