import { Controller, Post, Delete, Get, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { DelegationService } from './delegation.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Roles('college_admin', 'faculty')
@Controller('delegation')
export class DelegationController {
  constructor(private readonly delegationService: DelegationService) {}

  @Post()
  createDelegation(
    @Request() req: any,
    @Body() body: { delegateeId: string; roleId: string; validUntil: string; reason?: string }
  ) {
    return this.delegationService.createDelegation(
      req.user.uid,
      body.delegateeId,
      body.roleId,
      new Date(body.validUntil),
      body.reason
    );
  }

  @Delete(':id')
  revokeDelegation(@Request() req: any, @Param('id') id: string) {
    return this.delegationService.revokeDelegation(id, req.user.uid);
  }

  @Get('my')
  getMyDelegations(@Request() req: any) {
    return this.delegationService.getMyDelegations(req.user.uid);
  }
}
