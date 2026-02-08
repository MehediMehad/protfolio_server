// blog.validation.ts
import { z } from "zod";

const urlSchema = z.string().url("Invalid URL");

export const createBlogSchema = z.object({
    title: z.string().min(1, "Title is required"),

    content: z
        .string()
        .min(20, "Content must be at least 20 characters"),

    excerpt: z
        .string()
        .min(10, "Excerpt must be at least 10 characters")
        .max(300, "Excerpt cannot exceed 300 characters"),

    tags: z
        .array(z.string().min(1, "Tag cannot be empty"))
        .min(1, "At least one tag is required"),

    image: urlSchema,

    featured: z.boolean().optional(),

});

export const BlogValidations = {
    createBlogSchema,
};

