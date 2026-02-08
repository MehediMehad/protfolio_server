import { Router } from 'express';
import { CloudinaryFileUploader } from '../../middlewares/cloudinaryMulterMiddleware';
import CloudinaryValidateRequest from '../../middlewares/cloudinaryValidateRequest';
import { BlogValidations } from './blogs.validation';
import auth from '../../middlewares/auth';
import { BlogControllers } from './blogs.controller';

const router = Router();

// Create a new blog
router.post(
    '/',
    // auth('ADMIN'), // Uncomment if you want admin-only access
    CloudinaryFileUploader.uploadFields,
    CloudinaryValidateRequest(BlogValidations.createBlogSchema, {
        image: 'single',
    }),
    BlogControllers.createBlog,
);


// Get featured blogs
router.get('/featured', BlogControllers.getFeaturedBlogs);

export const BlogRoutes = router;
