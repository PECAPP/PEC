import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable()
export class PdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generateTranscript(userId: string): Promise<Buffer> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const PdfPrinterClass = PdfPrinter as any;
    const printer = new PdfPrinterClass(fonts);

    const tableBody = [
      ['Course Code', 'Course Name', 'Credits', 'Grade'],
      ...user.enrollments.map((e) => [
        e.course.code,
        e.course.name,
        e.course.credits.toString(),
        'N/A', // grade not available on enrollment
      ]),
    ];

    const docDefinition: TDocumentDefinitions = {
      defaultStyle: {
        font: 'Helvetica',
      },
      content: [
        { text: 'Official Academic Transcript', style: 'header', alignment: 'center', margin: [0, 0, 0, 20] },
        {
          columns: [
            { text: `Student Name: ${user.name}`, margin: [0, 0, 0, 10] },
            { text: `Email: ${user.email}`, alignment: 'right', margin: [0, 0, 0, 10] },
          ],
        },
        { text: `Date: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 20] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto'],
            body: tableBody,
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  async generateFeeReceipt(feeRecordId: string): Promise<Buffer> {
    const feeRecord = await this.prisma.feeRecord.findUnique({
      where: { id: feeRecordId },
      include: {
        student: true,
      },
    });

    if (!feeRecord) {
      throw new NotFoundException('FeeRecord not found');
    }

    const transaction = await this.prisma.financeTransaction.findFirst({
      where: { feeRecordId: feeRecord.id, status: 'success' },
    });

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const PdfPrinterClass = PdfPrinter as any;
    const printer = new PdfPrinterClass(fonts);

    const receiptNo = transaction?.receiptNo || 'PENDING';
    const paymentDate = transaction?.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A';

    const docDefinition: TDocumentDefinitions = {
      defaultStyle: {
        font: 'Helvetica',
      },
      content: [
        { text: 'Punjab Engineering College (PEC)', style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
        { text: 'Fee Receipt', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 30] },
        {
          columns: [
            { text: `Receipt No: ${receiptNo}`, margin: [0, 0, 0, 10] },
            { text: `Date: ${paymentDate}`, alignment: 'right', margin: [0, 0, 0, 10] },
          ],
        },
        { text: `Student Name: ${feeRecord.student.name}`, margin: [0, 0, 0, 5] },
        { text: `Email: ${feeRecord.student.email}`, margin: [0, 0, 0, 20] },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [{ text: 'Description', bold: true }, { text: 'Amount', bold: true }],
              [feeRecord.description, `Rs. ${feeRecord.amount.toFixed(2)}`],
              ...(feeRecord.lateFeeApplied ? [['Late Fee', `Rs. ${feeRecord.lateFeeAmount.toFixed(2)}`]] : []),
              [{ text: 'Total', bold: true }, { text: `Rs. ${(feeRecord.amount + (feeRecord.lateFeeApplied ? feeRecord.lateFeeAmount : 0)).toFixed(2)}`, bold: true }],
            ],
          },
        },
        { text: `Status: ${feeRecord.status.toUpperCase()}`, margin: [0, 20, 0, 0], bold: true },
        { text: `Category: ${feeRecord.category}`, margin: [0, 5, 0, 0] },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
        },
        subheader: {
          fontSize: 16,
          bold: true,
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
