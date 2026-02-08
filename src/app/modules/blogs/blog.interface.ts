import z from "zod";
import { BlogValidations } from "./blog.validation";

export type TCreateBlog = z.infer<typeof BlogValidations.createBlogSchema>;