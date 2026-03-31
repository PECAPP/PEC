import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { FacultyBioService } from './faculty-bio.service';

@UseGuards(AuthGuard)
@Controller('faculty-bio')
export class FacultyBioController {
  constructor(private readonly service: FacultyBioService) {}

  @Get()
  getAllFaculty(@Query('department') department?: string) {
    return this.service.getAllFaculty(department);
  }

  @Get(':id')
  getFacultyBio(@Param('id') id: string) {
    return this.service.getFacultyBio(id);
  }

  @Patch(':id')
  updateFacultyBio(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: {
      bio?: string;
      specialization?: string;
      qualifications?: string;
      phone?: string;
    },
  ) {
    if (req.user?.sub !== id && !req.user?.roles?.includes('admin')) {
      throw new Error('Unauthorized');
    }
    return this.service.updateFacultyBio(id, body);
  }
}
