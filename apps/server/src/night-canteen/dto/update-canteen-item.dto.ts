import { createZodDto } from "nestjs-zod";
import { canteenItemSchema } from "@pec/shared";

export class UpdateCanteenItemDto extends createZodDto(canteenItemSchema.partial()) {}
