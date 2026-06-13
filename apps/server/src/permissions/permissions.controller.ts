import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard, PoliciesGuard)
@Roles('college_admin')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @CheckPolicies((ability) => ability.can('manage', 'Permission'))
  create(@Request() req: any, @Body() createPermissionDto: any) {
    return this.permissionsService.create(createPermissionDto, req.user.uid);
  }

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'Permission'))
  findAll(@Query() query: { limit?: string; offset?: string }) {
    return this.permissionsService.findAll({
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      offset: query.offset ? parseInt(query.offset, 10) : undefined,
    });
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'Permission'))
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('manage', 'Permission'))
  update(@Request() req: any, @Param('id') id: string, @Body() updatePermissionDto: any) {
    return this.permissionsService.update(id, updatePermissionDto, req.user.uid);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('manage', 'Permission'))
  remove(@Request() req: any, @Param('id') id: string) {
    return this.permissionsService.remove(id, req.user.uid);
  }
}
