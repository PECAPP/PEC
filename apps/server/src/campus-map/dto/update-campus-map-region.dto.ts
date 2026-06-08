import { createZodDto } from 'nestjs-zod';
import { campusMapRegionSchema } from '@pec/shared';

export class UpdateCampusMapRegionDto extends createZodDto(campusMapRegionSchema.partial()) {}
