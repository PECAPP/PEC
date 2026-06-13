import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CourseMaterialsService } from './course-materials.service';
import { CourseMaterialQueryDto } from './dto/course-material-query.dto';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UpdateCourseMaterialDto, updateCourseMaterialSchema } from './dto/update-course-material.dto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'materials');

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('course-materials')
export class CourseMaterialsController {
  constructor(private readonly service: CourseMaterialsService) {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  @CheckPolicies((ability) => ability.can('read', 'CourseMaterial'))
  @Get()
  findMany(@Query() query: CourseMaterialQueryDto) {
    return this.service.findMany(query);
  }

  @CheckPolicies((ability) => ability.can('create', 'CourseMaterial'))
  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async create(
    @UploadedFile() file: any,
    @Body() body: any
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);
    
    await fs.promises.writeFile(filePath, file.buffer);

    return this.service.create({
      courseId: body.courseId,
      courseName: body.courseName,
      courseCode: body.courseCode,
      title: body.title,
      description: body.description || '',
      type: body.type || 'other',
      uploadedBy: body.uploadedBy || 'system', // Ideally from req.user
      fileURL: `/api/course-materials/download/${uniqueFilename}`,
    });
  }

  @CheckPolicies((ability) => ability.can('update', 'CourseMaterial'))
  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCourseMaterialSchema))
    body: UpdateCourseMaterialDto,
  ) {
    return this.service.update(id, body);
  }

  @Get('download/:filename')
  async download(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    return res.download(filePath, filename);
  }

  @CheckPolicies((ability) => ability.can('delete', 'CourseMaterial'))
  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Ideally we should fetch the record and delete the physical file too
    return this.service.delete(id);
  }
}

