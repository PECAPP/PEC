import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserQueryDto } from './dto/user-query.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('college_admin', 'admin', 'moderator', 'faculty')
  @Post()
  async create(
    @Body()
    body: {
      fullName: string;
      email: string;
      role: string;
      status?: string;
      department?: string;
      enrollmentNumber?: string;
      semester?: number;
      dateOfBirth?: string;
      employeeId?: string;
      designation?: string;
      specialization?: string;
      phone?: string;
    },
  ) {
    const data = await this.usersService.createAdminUser(body);
    return { success: true, data };
  }

  @Roles('college_admin', 'admin', 'moderator', 'faculty')
  @Get()
  async findMany(@Request() req: any, @Query() query: UserQueryDto) {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];
    const requesterRole = userRoles.includes('faculty')
      ? 'faculty'
      : req.user?.role;

    const result = await this.usersService.findMany({
      role: query.role,
      department: query.department,
      semester: query.semester,
      limit: query.limit || 100,
      offset: query.offset || 0,
      requesterId: req.user?.sub,
      requesterRole,
    });
    return {
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        limit: query.limit || 100,
        offset: query.offset || 0,
      },
    };
  }

  @Roles('college_admin', 'admin', 'moderator', 'faculty')
  @Get('search')
  async search(@Query('email') email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) return null;
    return this.usersService.toPublicUserRecord(user as any);
  }

  @Roles('student', 'faculty', 'college_admin', 'admin', 'moderator')
  @Get(':id')
  async findOne(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const isOwner = req.user?.sub === id;
    const elevatedRoles = new Set(['college_admin', 'admin', 'moderator']);
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];
    const isElevated = userRoles.some((role: string) =>
      elevatedRoles.has(role),
    );

    if (!isOwner && !isElevated) {
      throw new ForbiddenException('You can only access your own user record');
    }

    const user = await this.usersService.findById(id);
    if (!user) {
      return null;
    }

    return this.usersService.toPublicUserRecord(user as any);
  }

  @Roles('college_admin', 'admin', 'moderator', 'faculty')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body()
    body: {
      fullName?: string;
      email?: string;
      role?: string;
      status?: string;
      department?: string;
      enrollmentNumber?: string;
      semester?: number;
      dateOfBirth?: string;
      employeeId?: string;
      designation?: string;
      specialization?: string;
      phone?: string;
    },
  ) {
    const data = await this.usersService.updateAdminUser(id, body);
    return { success: true, data };
  }

  @Roles('college_admin', 'admin', 'moderator', 'faculty')
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.usersService.deleteAdminUser(id);
    return { success: true, data };
  }
}
