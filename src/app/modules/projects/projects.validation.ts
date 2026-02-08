import { z } from "zod";
import { ProjectTypeEnum, ProjectCategoryEnum, ProjectStatusEnum } from "@prisma/client";

const urlSchema = z.string().url("Invalid URL");

const roleFeatureSchema = z.object({
    role: z.string().min(1, "Role is required"),
    features: z
        .array(z.string().min(1))
        .min(1, "At least one feature is required"),
});

const projectHighlightSchema = z.object({
    title: z.string().min(1, "Highlight title is required"),
    description: z
        .string()
        .min(5, "Highlight description must be at least 5 characters"),
});

export const createProjectSchema = z.object({
    title: z.string().min(1, "Title is required"),

    subtitle: z.string().min(1, "Subtitle is required"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),

    overview: z
        .string()
        .min(10, "Overview must be at least 10 characters"),

    type: z.enum(ProjectTypeEnum),

    status: z.enum(ProjectStatusEnum),

    category: z.enum(ProjectCategoryEnum),

    technologies: z
        .array(z.string().min(1))
        .min(1, "At least one technology is required"),

    features: z
        .array(z.string().min(1))
        .min(1, "At least one feature is required"),

    rolesFeatures: z
        .array(roleFeatureSchema)
        .min(1, "At least one role feature is required"),

    highlights: z
        .array(projectHighlightSchema)
        .min(1, "At least one highlight is required"),

    image: urlSchema,

    liveUrl: urlSchema,

    frontendGitHubUrl: urlSchema,

    backendGitHubUrl: urlSchema,

    isFeatured: z.boolean().optional(),
});

export const ProjectValidations = {
    createProjectSchema,
};
