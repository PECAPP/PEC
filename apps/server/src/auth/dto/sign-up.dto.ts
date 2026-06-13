import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  role: z.string().optional(),
});



export class SignUpDto extends createZodDto(signUpSchema) {
}
