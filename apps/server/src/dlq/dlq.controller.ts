import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DlqService } from './dlq.service';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';

@Controller('admin/dlq')
@UseGuards(AuthGuard, PoliciesGuard)
@CheckPolicies((ability) => ability.can('manage', 'all'))
export class DlqController {
  constructor(private readonly dlqService: DlqService) {}

  @Get('messages')
  async getDeadLetterMessages() {
    const messages = await this.dlqService.getDeadLetterMessages();
    return { success: true, messages };
  }

  @Post('replay')
  async replayMessages(@Body() body: { targetExchange?: string; routingKey?: string }) {
    const result = await this.dlqService.replayMessages(
      'pec_dlq',
      body.targetExchange || 'pec_exchange',
      body.routingKey
    );
    return result;
  }
}
