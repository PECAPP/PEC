import { IsString } from 'class-validator';

export class ParsePdfDto {
  @IsString()
  pdfBase64: string;
}
