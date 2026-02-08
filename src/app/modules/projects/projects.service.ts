import httpStatus from 'http-status';

import config from '../../configs';
import ApiError from '../../errors/ApiError';
import prisma from '../../libs/prisma';
import { TCreateProject } from './projects.interface';

const createProject = async (payload: TCreateProject) => {
    const project = await prisma.project.create({
        data: payload
    });
    return project;
};
const getFeaturedProjects = async () => {
    const projects = await prisma.project.findMany({
        where: {
            isFeatured: true
        },
    });
    return projects;
};

export const ProjectServices = {
    createProject,
    getFeaturedProjects
};