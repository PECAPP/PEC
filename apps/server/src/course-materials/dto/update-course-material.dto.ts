import { createZodDto } from "nestjs-zod";
import { createCourseMaterialSchema } from "./create-course-material.dto";

export const updateCourseMaterialSchema = createCourseMaterialSchema.partial();

export class UpdateCourseMaterialDto extends createZodDto(updateCourseMaterialSchema) {}
