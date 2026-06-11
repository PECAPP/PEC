import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  health: string;
  uptime: string;
  cpuPercent: string;
  memoryUsage: string;
  memoryLimit: string;
  memoryPercent: string;
  ports: string;
  restartCount: number;
}

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);

  private async exec(cmd: string): Promise<string> {
    try {
      const { stdout } = await execAsync(cmd, { timeout: 15_000 });
      return stdout.trim();
    } catch (err: any) {
      this.logger.error(`Docker CLI error: ${err.message}`);
      throw err;
    }
  }

  async listContainers(): Promise<ContainerInfo[]> {
    const psOut = await this.exec(
      `docker ps -a --format '{"id":"{{.ID}}","name":"{{.Names}}","image":"{{.Image}}","status":"{{.Status}}","state":"{{.State}}","ports":"{{.Ports}}"}'`
    );

    if (!psOut) return [];

    const containers: ContainerInfo[] = psOut
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean)
      .map((c: any) => ({
        ...c,
        health: 'unknown',
        uptime: c.status,
        cpuPercent: '0',
        memoryUsage: '0',
        memoryLimit: '0',
        memoryPercent: '0',
        restartCount: 0,
      }));

    const runningIds = containers
      .filter((c) => c.state === 'running')
      .map((c) => c.id);

    const allIds = containers.map((c) => c.id);

    // Get restart counts for all containers
    if (allIds.length > 0) {
      try {
        const restartOut = await this.exec(
          `docker inspect --format '{{.Id}} {{.RestartCount}}' ${allIds.join(' ')}`
        );
        restartOut.split('\n').filter(Boolean).forEach((line) => {
          const parts = line.trim().split(' ');
          if (parts.length >= 2) {
            const shortId = parts[0].substring(0, 12);
            const container = containers.find((c) => c.id === shortId || parts[0].startsWith(c.id));
            if (container) container.restartCount = parseInt(parts[1], 10) || 0;
          }
        });
      } catch (e) {
        this.logger.warn(`Failed to get restart counts: ${e}`);
      }
    }

    if (runningIds.length > 0) {
      try {
        // Use JSON output to avoid template errors when .State.Health is missing
        const inspectOut = await this.exec(
          `docker inspect ${runningIds.join(' ')}`
        );
        const inspected: any[] = JSON.parse(inspectOut);
        const healthMap: Record<string, string> = {};
        for (const c of inspected) {
          const shortId = (c.Id as string).substring(0, 12);
          healthMap[shortId] = c.State?.Health?.Status ?? 'none';
        }
        containers.forEach((c) => {
          const h = healthMap[c.id];
          if (h) c.health = h;
        });

        // docker stats --no-stream first sample is always 0% CPU (needs delta).
        // Use name for matching since it's unambiguous, and JSON for reliable parsing.
        const statsOut = await this.exec(
          `docker stats --no-stream --format '{"name":"{{.Name}}","cpu":"{{.CPUPerc}}","mem":"{{.MemUsage}}","memPerc":"{{.MemPerc}}"}' ${runningIds.join(' ')}`
        );
        statsOut.split('\n').filter(Boolean).forEach((line) => {
          try {
            const s = JSON.parse(line);
            const rawName: string = (s.name as string).replace(/^\//, '');
            const container = containers.find((c) => c.name === rawName);
            if (container) {
              container.cpuPercent = s.cpu;
              container.memoryPercent = s.memPerc;
              const splitMem = (s.mem as string).split('/');
              container.memoryUsage = splitMem[0]?.trim() ?? '0';
              container.memoryLimit = splitMem[1]?.trim() ?? '0';
            } else {
              this.logger.warn(`Container not found for stats name: ${rawName}`);
            }
          } catch (err) {
            this.logger.error(`Failed to parse stats line: ${line} - error: ${err}`);
          }
        });
      } catch (e) {
        this.logger.warn(`Failed to get detailed stats: ${e}`);
      }
    }

    return containers;
  }

  async startContainer(id: string): Promise<{ success: boolean; message: string }> {
    await this.assertContainerExists(id);
    await this.exec(`docker start ${id}`);
    return { success: true, message: `Container ${id} started` };
  }

  async stopContainer(id: string): Promise<{ success: boolean; message: string }> {
    await this.assertContainerExists(id);
    await this.exec(`docker stop ${id}`);
    return { success: true, message: `Container ${id} stopped` };
  }

  async restartContainer(id: string): Promise<{ success: boolean; message: string }> {
    await this.assertContainerExists(id);
    await this.exec(`docker restart ${id}`);
    return { success: true, message: `Container ${id} restarted` };
  }

  async getContainerLogs(id: string, tail = 100): Promise<{ logs: string }> {
    await this.assertContainerExists(id);
    const logs = await this.exec(`docker logs --tail ${tail} ${id} 2>&1`);
    return { logs };
  }

  private async assertContainerExists(id: string): Promise<void> {
    try {
      await this.exec(`docker inspect ${id}`);
    } catch {
      throw new NotFoundException(`Container ${id} not found`);
    }
  }
}
