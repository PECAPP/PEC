import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DockerService } from './docker.service';
import { AuthGuard } from '../../auth/auth.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { CheckPolicies } from '../../auth/decorators/check-policies.decorator';
import { ok } from '../../common/utils/api-response';

@Controller('admin/docker')
@UseGuards(AuthGuard, PoliciesGuard)
@CheckPolicies((ability) => ability.can('read', 'Admin'))
export class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @Get('containers')
  async listContainers() {
    const data = await this.dockerService.listContainers();
    return ok(data);
  }

  @Post('containers/:id/start')
  async startContainer(@Param('id') id: string) {
    const data = await this.dockerService.startContainer(id);
    return ok(data);
  }

  @Post('containers/:id/stop')
  async stopContainer(@Param('id') id: string) {
    const data = await this.dockerService.stopContainer(id);
    return ok(data);
  }

  @Post('containers/:id/restart')
  async restartContainer(@Param('id') id: string) {
    const data = await this.dockerService.restartContainer(id);
    return ok(data);
  }

  @Get('containers/:id/logs')
  async getContainerLogs(
    @Param('id') id: string,
    @Query('tail') tail?: string,
  ) {
    const data = await this.dockerService.getContainerLogs(
      id,
      tail ? parseInt(tail, 10) : 100,
    );
    return ok(data);
  }
}
