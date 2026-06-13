import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createCampusMapRoadSchema = z.object({
  points: z.array(z.any()),
  width: z.number(),
  organizationId: z.string().optional(),
});



export class CreateCampusMapRoadDto extends createZodDto(createCampusMapRoadSchema) {
}
