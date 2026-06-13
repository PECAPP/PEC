import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RolesMgmtService } from './roles-mgmt.service';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard, PoliciesGuard)
@Roles('college_admin')
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

  @Get('user/:userId')
  @CheckPolicies((ability) => ability.can('read', 'Role'))
  getUserRoles(@Param('userId') userId: string) {
    return this.rolesMgmtService.getUserRoles(userId);
  }

  @Post('user/:userId/assign')
  @CheckPolicies((ability) => ability.can('manage', 'Role'))
  assignRole(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body() body: { roleId: string; validFrom?: string; validUntil?: string }
  ) {
    return this.rolesMgmtService.assignRole(
      userId,
      body.roleId,
      req.user.uid,
      {
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      }
    );
  }

  @Delete('user/:userId/revoke/:roleId')
  @CheckPolicies((ability) => ability.can('manage', 'Role'))
  revokeRole(@Request() req: any, @Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.rolesMgmtService.revokeRole(userId, roleId, req.user.uid);
  }
}


