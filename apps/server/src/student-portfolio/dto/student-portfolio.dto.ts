import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createStudentProjectSchema = z.object({
  studentId: z.string(),
  title: z.string(),
  description: z.string(),
  techStack: z.string().optional(),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isFeatured: z.boolean().optional(),
});



export class CreateStudentProjectDto extends createZodDto(createStudentProjectSchema) {
}
export const updateStudentProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  techStack: z.string().optional(),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isFeatured: z.boolean().optional(),
});



export class UpdateStudentProjectDto extends createZodDto(updateStudentProjectSchema) {
}
export const createStudentSkillSchema = z.object({
  studentId: z.string(),
  name: z.string(),
  level: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  category: z.string().optional(),
});



export class CreateStudentSkillDto extends createZodDto(createStudentSkillSchema) {
}
export const updateStudentSkillSchema = z.object({
  name: z.string().optional(),
  level: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  category: z.string().optional(),
});



export class UpdateStudentSkillDto extends createZodDto(updateStudentSkillSchema) {
}
