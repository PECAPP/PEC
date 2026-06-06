import { Module } from '@nestjs/common';
import { StudentPortfolioController } from './student-portfolio.controller';
import { StudentPortfolioService } from './student-portfolio.service';

@Module({
  controllers: [StudentPortfolioController],
  providers: [StudentPortfolioService],
})
export class StudentPortfolioModule {}
