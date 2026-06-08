import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const parsePdfSchema = z.object({
  pdfBase64: z.string(),
});



export class ParsePdfDto extends createZodDto(parsePdfSchema) {
}
