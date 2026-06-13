import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Controller()
export class DataExportConsumer {
  private readonly logger = new Logger(DataExportConsumer.name);
  private s3Client: S3Client | null = null;

  constructor(private readonly prisma: PrismaService) {
    if (process.env.S3_REGION && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
      this.s3Client = new S3Client({
        region: process.env.S3_REGION,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
        endpoint: process.env.S3_ENDPOINT, // Optional for MinIO
        forcePathStyle: true,
      });
    }
  }

  @EventPattern('data-export')
  async handleDataExport(@Payload() data: any) {
    const { userId } = data;
    this.logger.log(`Starting data export for user: ${userId}`);

    try {
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

      const exportData = JSON.stringify(user, null, 2);
      const filename = `export_${userId}_${Date.now()}.json`;

      if (this.s3Client) {
        await this.s3Client.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME || 'pec-exports',
          Key: filename,
          Body: Buffer.from(exportData),
          ContentType: 'application/json',
        }));
        this.logger.log(`Uploaded ${filename} to S3/MinIO`);
      } else {
        this.logger.warn(`S3 not configured. Would have uploaded ${filename} with ${exportData.length} bytes.`);
      }

      await this.prisma.notification.create({
        data: {
          userId,
          title: 'Data Export Complete',
          message: 'Your requested data export is ready.',
          type: 'success',
          link: `/exports/${filename}`,
        }
      });

      this.logger.log(`Data export complete for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed data export for user: ${userId}`, error);
    }
  }
}
