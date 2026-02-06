import z from "zod";
import { ProjectValidations } from "./projects.validation";

export type TCreateProject = z.infer<typeof ProjectValidations.createProjectSchema>;