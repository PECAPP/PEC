import { createZodDto } from "nestjs-zod";
import { canteenItemSchema } from "@pec/shared";

export class CreateCanteenItemDto extends createZodDto(canteenItemSchema) {}
