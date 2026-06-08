import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});



export class SignInDto extends createZodDto(signInSchema) {
}
