import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createPublicationSchema = z.object({
  facultyId: z.string(),
  title: z.string(),
  journal: z.string().optional(),
  conference: z.string().optional(),
  year: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  doi: z.string().optional(),
  url: z.string().optional(),
  abstract: z.string().optional(),
  citations: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  coAuthors: z.string().optional(),
});



export class CreatePublicationDto extends createZodDto(createPublicationSchema) {
}
export const createAwardSchema = z.object({
  facultyId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  awardedBy: z.string().optional(),
  year: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  category: z.string().optional(),
});



export class CreateAwardDto extends createZodDto(createAwardSchema) {
}
export const createConferenceSchema = z.object({
  facultyId: z.string(),
  name: z.string(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  role: z.string().optional(),
  presentationTitle: z.string().optional(),
  description: z.string().optional(),
});



export class CreateConferenceDto extends createZodDto(createConferenceSchema) {
}
export const createConsultationSchema = z.object({
  facultyId: z.string(),
  organization: z.string(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
});



export class CreateConsultationDto extends createZodDto(createConsultationSchema) {
}
