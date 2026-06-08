import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'Permission'))
  create(@Body() createPermissionDto: any) {
    return this.permissionsService.create(createPermissionDto);
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
  @CheckPolicies((ability) => ability.can('update', 'Permission'))
  update(@Param('id') id: string, @Body() updatePermissionDto: any) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'Permission'))
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
