import prisma from '../../libs/prisma';
import { TCreateBlog } from './blogs.interface';

const createBlog = async (payload: TCreateBlog) => {
    const blog = await prisma.blog.create({
        data: payload,
    });
    return blog;
};

const getFeaturedBlogs = async () => {
    const blogs = await prisma.blog.findMany({
        where: {
            featured: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return blogs;
};

const getBlogById = async (id: string) => {
    const blog = await prisma.blog.findUniqueOrThrow({
        where: { id },
    });
    return blog;
};


export const BlogServices = {
    createBlog,
    getFeaturedBlogs,
    getBlogById
};
