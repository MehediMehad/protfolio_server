import prisma from '../../libs/prisma';
import { TCreateBlog } from './blogs.interface';

const createBlog = async (payload: TCreateBlog) => {
    const blog = await prisma.blog.create({
        data: payload,
    });
    return blog;
};

export const BlogServices = {
    createBlog,
};
