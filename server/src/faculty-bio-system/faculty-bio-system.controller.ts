import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
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

  @Post('publications')
  createPublication(@Body() body: CreatePublicationDto) {
    return this.service.createPublication(body);
  }

  @Patch('publications/:id')
  updatePublication(@Param('id') id: string, @Body() body: Partial<CreatePublicationDto>) {
    return this.service.updatePublication(id, body);
  }

  @Delete('publications/:id')
  deletePublication(@Param('id') id: string) {
    return this.service.deletePublication(id);
  }

  @Get(':facultyId/awards')
  getAwards(@Param('facultyId') facultyId: string) {
    return this.service.getAwards(facultyId);
  }

  @Post('awards')
  createAward(@Body() body: CreateAwardDto) {
    return this.service.createAward(body);
  }

  @Patch('awards/:id')
  updateAward(@Param('id') id: string, @Body() body: Partial<CreateAwardDto>) {
    return this.service.updateAward(id, body);
  }

  @Delete('awards/:id')
  deleteAward(@Param('id') id: string) {
    return this.service.deleteAward(id);
  }

  @Get(':facultyId/conferences')
  getConferences(@Param('facultyId') facultyId: string) {
    return this.service.getConferences(facultyId);
  }

  @Post('conferences')
  createConference(@Body() body: CreateConferenceDto) {
    return this.service.createConference(body);
  }

  @Patch('conferences/:id')
  updateConference(@Param('id') id: string, @Body() body: Partial<CreateConferenceDto>) {
    return this.service.updateConference(id, body);
  }

  @Delete('conferences/:id')
  deleteConference(@Param('id') id: string) {
    return this.service.deleteConference(id);
  }

  @Get(':facultyId/consultations')
  getConsultations(@Param('facultyId') facultyId: string) {
    return this.service.getConsultations(facultyId);
  }

  @Post('consultations')
  createConsultation(@Body() body: CreateConsultationDto) {
    return this.service.createConsultation(body);
  }

  @Patch('consultations/:id')
  updateConsultation(@Param('id') id: string, @Body() body: Partial<CreateConsultationDto>) {
    return this.service.updateConsultation(id, body);
  }

  @Delete('consultations/:id')
  deleteConsultation(@Param('id') id: string) {
    return this.service.deleteConsultation(id);
  }
}
