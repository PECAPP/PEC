import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { AuthGuard } from '../auth/auth.guard';
import { ok } from '../common/utils/api-response';

@UseGuards(AuthGuard)
@Controller('clubs')
export class ClubsController {
  constructor(private readonly service: ClubsService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return ok(data);
  }

  @Get('my-requests')
  async getMyRequests(@Request() req: any) {
    const data = await this.service.getMyRequests(req.user.sub);
    return ok(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return ok(data);
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Request() req: any, @Body('proposalText') proposalText: string) {
    const data = await this.service.createJoinRequest(id, req.user.sub, proposalText);
    return ok(data);
  }
}
