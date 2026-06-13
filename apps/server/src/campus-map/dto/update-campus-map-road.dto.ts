import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const updateCampusMapRoadSchema = z.object({
  points: z.array(z.any()).optional(),
  width: z.number().optional(),
  organizationId: z.string().optional(),
});



export class UpdateCampusMapRoadDto extends createZodDto(updateCampusMapRoadSchema) {
}
