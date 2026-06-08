import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class DataExportConsumer {
  private readonly logger = new Logger(DataExportConsumer.name);

  constructor(private readonly prisma: PrismaService) {}

  @EventPattern('data-export')
  async handleDataExport(@Payload() data: any) {
    const { userId } = data;
    this.logger.log(`Starting data export for user: ${userId}`);

    try {
      // 1. Gather all data
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          studentProfile: true,
          attendances: true,
          cgpaEntries: true,
          feeRecords: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 2. Format into JSON
      const exportData = JSON.stringify(user, null, 2);

      // 3. Mock MinIO Upload
      // await this.minioService.uploadFile('exports', `export_${userId}.json`, Buffer.from(exportData), 'application/json');

      // 4. Mock Dispatch Notification
      // await this.notificationService.send(userId, 'Data Export Complete', 'Your data export is ready to download.');

      this.logger.log(`Data export complete for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed data export for user: ${userId}`, error);
    }
  }
}
