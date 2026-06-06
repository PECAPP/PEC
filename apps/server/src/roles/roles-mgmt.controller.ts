import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesMgmtService } from './roles-mgmt.service';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('roles')
export class RolesMgmtController {
  constructor(private readonly rolesMgmtService: RolesMgmtService) {}

  @Post()
  @CheckPolicies((ability) => ability.can('manage', 'Role'))
  create(@Body() createRoleDto: any) {
    return this.rolesMgmtService.create(createRoleDto);
  }

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'Role'))
  findAll() {
    return this.rolesMgmtService.findAll();
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'Role'))
  findOne(@Param('id') id: string) {
    return this.rolesMgmtService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('manage', 'Role'))
  update(@Param('id') id: string, @Body() updateRoleDto: any) {
    return this.rolesMgmtService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('manage', 'Role'))
  remove(@Param('id') id: string) {
    return this.rolesMgmtService.remove(id);
  }
}
