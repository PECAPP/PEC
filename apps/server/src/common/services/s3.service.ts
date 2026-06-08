import { Injectable, Logger, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private readonly bucket = process.env.MINIO_BUCKET || 'pec-uploads';

  onModuleInit() {
    this.s3Client = new S3Client({
      region: 'us-east-1', // MinIO doesn't care about region but AWS SDK requires it
      endpoint: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'admin123',
      },
      forcePathStyle: true, // Crucial for MinIO
    });
    this.logger.log(`S3Service initialized connected to ${process.env.MINIO_ENDPOINT}`);
  }

  /**
   * Uploads a file buffer to S3/MinIO
   * @param buffer File buffer to upload
   * @param originalName Original file name to extract extension
   * @param mimetype File mime type
   * @returns The generated S3 object key
   */
  async uploadFile(buffer: Buffer, originalName: string, mimetype: string): Promise<string> {
    const ext = originalName.split('.').pop();
    const key = `${uuidv4()}.${ext}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      });

      await this.s3Client.send(command);
      return key;
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error.message}`, error);
      throw new HttpException('Failed to upload file to storage', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generates a pre-signed URL to download a file securely
   * @param key S3 Object key
   * @param expiresIn Expiration time in seconds (default: 3600)
   * @returns Pre-signed URL string
   */
  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      // Important: Use getSignedUrl from '@aws-sdk/s3-request-presigner'
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Error generating pre-signed URL for key ${key}: ${error.message}`, error);
      throw new HttpException('Failed to generate download URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Deletes a file from S3/MinIO
   * @param key S3 Object key
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`Error deleting file from S3 for key ${key}: ${error.message}`, error);
      // We don't necessarily want to fail a larger transaction just because S3 delete failed
    }
  }
}
