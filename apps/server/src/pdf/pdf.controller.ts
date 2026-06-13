import { Controller, Get, Request, Res, UseGuards, Param } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { AuthGuard } from '../auth/auth.guard';
import { Response } from 'express';

@UseGuards(AuthGuard)
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('transcript')
  async downloadTranscript(@Request() req: any, @Res() res: Response) {
    try {
      const buffer = await this.pdfService.generateTranscript(req.user.sub);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="transcript.pdf"',
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to generate transcript' });
    }
  }

  @Get('fee-receipt/:feeRecordId')
  async downloadFeeReceipt(@Param('feeRecordId') feeRecordId: string, @Res() res: Response) {
    try {
      const buffer = await this.pdfService.generateFeeReceipt(feeRecordId);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fee-receipt-${feeRecordId}.pdf"`,
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to generate fee receipt' });
    }
  }
}
