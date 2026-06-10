import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export enum UserRole {
  ADMIN = 'admin',
  FACULTY = 'faculty',
  STUDENT = 'student',
}
export const userQuerySchema = z.object({
  role: z.string().optional(),
  department: z.string().optional(),
  semester: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  search: z.string().optional(),
  status: z.string().optional(),
});



export class UserQueryDto extends createZodDto(userQuerySchema) {
}
