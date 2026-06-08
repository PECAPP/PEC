import { createZodDto } from 'nestjs-zod';
import { campusMapRegionSchema } from '@pec/shared';

export class CreateCampusMapRegionDto extends createZodDto(campusMapRegionSchema) {}
