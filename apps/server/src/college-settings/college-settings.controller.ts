import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { CollegeSettingsService } from './college-settings.service';
import { AuthGuard } from '../auth/auth.guard';


import { ok } from '../common/utils/api-response';

@Controller('pec-settings')
export class CollegeSettingsController {
  constructor(private readonly service: CollegeSettingsService) {}

  @Get()
  async getSettings() {
    const data = await this.service.getSettings();
    return ok(data);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can('update', 'all'))
  @Patch()
  async updateSettings(@Body() data: any) {
    const updated = await this.service.updateSettings(data);
    return ok(updated);
  }
}
