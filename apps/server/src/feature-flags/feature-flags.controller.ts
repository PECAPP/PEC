import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { AuthGuard } from '../auth/auth.guard';


import { ok } from '../common/utils/api-response';
import { FeatureFlagsService } from './feature-flags.service';
import { UpsertFeatureFlagDto } from './dto/upsert-feature-flag.dto';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @CheckPolicies((ability) => ability.can('read', 'FeatureFlag'))
  @Get()
  async listAll() {
    const data = await this.featureFlagsService.listAll();
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('read', 'FeatureFlag'))
  @Get(':key')
  async getByKey(@Param('key') key: string) {
    const data = await this.featureFlagsService.getByKey(key);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'FeatureFlag'))
  @Post(':key')
  async upsert(@Param('key') key: string, @Body() body: UpsertFeatureFlagDto) {
    const data = await this.featureFlagsService.upsert(key, { ...body, enabled: body.enabled ?? false });
    return ok(data);
  }
}
