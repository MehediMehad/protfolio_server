import { z } from "zod";
import { ProjectTypeEnum, ProjectCategoryEnum } from "@prisma/client";

const urlSchema = z.string().url("Invalid URL");

export const createProjectSchema = z.object({
    title: z.string().min(1, "Title is required"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),

    overview: z
        .string()
        .min(10, "Overview must be at least 10 characters"),

    type: z.enum(ProjectTypeEnum),

    category: z.enum(ProjectCategoryEnum),

    technologies: z
        .array(z.string().min(1))
        .min(1, "At least one technology is required"),

    mainFeatures: z
        .array(z.string().min(1))
        .min(1, "At least one feature is required"),

    metadata: z.record(z.string(), z.any()),

    image: urlSchema,

    liveUrl: urlSchema,

    frontendGitHubUrl: urlSchema.optional(),

    backendGitHubUrl: urlSchema.optional(),

    githubUrl: urlSchema.optional(),
}).refine((data) => {
    if (!data.frontendGitHubUrl && !data.backendGitHubUrl && !data.githubUrl) {
        return false;
    }
    return true;
})

export const ProjectValidations = {
    createProjectSchema,
};