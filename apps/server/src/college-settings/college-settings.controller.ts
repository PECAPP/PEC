import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { CollegeSettingsService } from './college-settings.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ok } from '../common/utils/api-response';

@Controller('college-settings')
export class CollegeSettingsController {
  constructor(private readonly service: CollegeSettingsService) {}

  @Get()
  async getSettings() {
    const data = await this.service.getSettings();
    return ok(data);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('college_admin', 'admin')
  @Patch()
  async updateSettings(@Body() data: any) {
    const updated = await this.service.updateSettings(data);
    return ok(updated);
  }
}
