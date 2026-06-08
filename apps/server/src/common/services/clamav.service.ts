import { Injectable, Logger, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import NodeClam from 'clamscan';
import { Readable } from 'stream';

@Injectable()
export class ClamavService implements OnModuleInit {
  private readonly logger = new Logger(ClamavService.name);
  private clamscan: any;
  private initialized = false;

  async onModuleInit() {
    try {
      this.clamscan = await new NodeClam().init({
        removeInfected: false, 
        quarantineInfected: false,
        scanLog: null,
        debugMode: false,
        fileList: null,
        scanRecursively: true,
        clamdscan: {
          host: process.env.CLAMAV_HOST || 'localhost',
          port: parseInt(process.env.CLAMAV_PORT || '3310', 10),
          timeout: 60000,
          localFallback: false,
          path: null,
          configFile: null,
          multiscan: true,
          reloadDb: false,
          active: true,
          bypassTest: false,
        },
        preference: 'clamdscan',
      });
      this.initialized = true;
      this.logger.log(`ClamAV scanner connected to ${process.env.CLAMAV_HOST}:${process.env.CLAMAV_PORT}`);
    } catch (error) {
      this.logger.error('Failed to initialize ClamAV scanner. File uploads will be rejected.', error);
      this.initialized = false;
    }
  }

  /**
   * Scans a file buffer for viruses
   * @param buffer File buffer to scan
   * @param filename Optional filename for logging
   * @throws HttpException if virus found or scanner unavailable
   */
  async scanBuffer(buffer: Buffer, filename = 'unknown'): Promise<boolean> {
    if (!this.initialized) {
      this.logger.error('Attempted to scan file but ClamAV is not initialized');
      throw new HttpException('Anti-virus scanning service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }

    try {
      const stream = Readable.from(buffer);
      const { isInfected, viruses } = await this.clamscan.scanStream(stream);

      if (isInfected) {
        this.logger.warn(`🦠 Virus detected in upload '${filename}'! Signature: ${viruses.join(', ')}`);
        throw new HttpException(`Malicious file detected. Upload rejected.`, HttpStatus.UNPROCESSABLE_ENTITY);
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error scanning file '${filename}'`, error);
      throw new HttpException('Failed to scan file for malware', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
