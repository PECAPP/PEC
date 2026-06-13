import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FacultyBioSystemService } from './faculty-bio-system.service';
import {
  CreatePublicationDto,
  CreateAwardDto,
  CreateConferenceDto,
  CreateConsultationDto,
} from './dto/faculty-bio.dto';

@UseGuards(AuthGuard)
@Controller('faculty-bio-system')
export class FacultyBioSystemController {
  constructor(private readonly service: FacultyBioSystemService) {}

  @Get(':facultyId')
  getFullProfile(@Param('facultyId') facultyId: string) {
    return this.service.getFullProfile(facultyId);
  }

  @Get(':facultyId/publications')
  getPublications(@Param('facultyId') facultyId: string) {
    return this.service.getPublications(facultyId);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Post('publications')
  createPublication(@Body() body: CreatePublicationDto) {
    return this.service.createPublication(body);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Patch('publications/:id')
  updatePublication(@Param('id') id: string, @Body() body: Partial<CreatePublicationDto>) {
    return this.service.updatePublication(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Delete('publications/:id')
  deletePublication(@Param('id') id: string) {
    return this.service.deletePublication(id);
  }

  @Get(':facultyId/awards')
  getAwards(@Param('facultyId') facultyId: string) {
    return this.service.getAwards(facultyId);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Post('awards')
  createAward(@Body() body: CreateAwardDto) {
    return this.service.createAward(body);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Patch('awards/:id')
  updateAward(@Param('id') id: string, @Body() body: Partial<CreateAwardDto>) {
    return this.service.updateAward(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Delete('awards/:id')
  deleteAward(@Param('id') id: string) {
    return this.service.deleteAward(id);
  }

  @Get(':facultyId/conferences')
  getConferences(@Param('facultyId') facultyId: string) {
    return this.service.getConferences(facultyId);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Post('conferences')
  createConference(@Body() body: CreateConferenceDto) {
    return this.service.createConference(body);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Patch('conferences/:id')
  updateConference(@Param('id') id: string, @Body() body: Partial<CreateConferenceDto>) {
    return this.service.updateConference(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Delete('conferences/:id')
  deleteConference(@Param('id') id: string) {
    return this.service.deleteConference(id);
  }

  @Get(':facultyId/consultations')
  getConsultations(@Param('facultyId') facultyId: string) {
    return this.service.getConsultations(facultyId);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Post('consultations')
  createConsultation(@Body() body: CreateConsultationDto) {
    return this.service.createConsultation(body);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Patch('consultations/:id')
  updateConsultation(@Param('id') id: string, @Body() body: Partial<CreateConsultationDto>) {
    return this.service.updateConsultation(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Delete('consultations/:id')
  deleteConsultation(@Param('id') id: string) {
    return this.service.deleteConsultation(id);
  }
}
