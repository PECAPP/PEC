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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { CourseMaterialsService } from './course-materials.service';
import { CourseMaterialQueryDto } from './dto/course-material-query.dto';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';

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
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async create(
    @UploadedFile() file: Express.Multer.File,
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

  @Get('download/:filename')
  async download(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    return res.download(filePath, filename);
  }

  @CheckPolicies((ability) => ability.can('delete', 'CourseMaterial'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Ideally we should fetch the record and delete the physical file too
    return this.service.delete(id);
  }
}

