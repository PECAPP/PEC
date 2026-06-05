import { IsString, IsOptional } from 'class-validator';

export class SyncSocialDto {
  @IsOptional()
  @IsString()
  githubUsername?: string;

  @IsOptional()
  @IsString()
  linkedinUsername?: string;
}
