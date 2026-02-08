import z from "zod";
import { BlogValidations } from "./blogs.validation";

export type TCreateBlog = z.infer<typeof BlogValidations.createBlogSchema>;