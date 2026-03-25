import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ok } from '../common/utils/api-response';
import { FeatureFlagsService } from './feature-flags.service';
import { UpsertFeatureFlagDto } from './dto/upsert-feature-flag.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Roles('admin', 'college_admin', 'moderator')
  @Get()
  async listAll() {
    const data = await this.featureFlagsService.listAll();
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin', 'admin', 'moderator', 'user')
  @Get(':key')
  async getByKey(@Param('key') key: string) {
    const data = await this.featureFlagsService.getByKey(key);
    return ok(data);
  }

  @Roles('admin', 'college_admin', 'moderator')
  @Post(':key')
  async upsert(@Param('key') key: string, @Body() body: UpsertFeatureFlagDto) {
    const data = await this.featureFlagsService.upsert(key, body);
    return ok(data);
  }
}
