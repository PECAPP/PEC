import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { AuthGuard } from '../auth/auth.guard';
import { BookQueryDto } from './dto/book-query.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { ok } from '../common/utils/api-response';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Roles('student', 'faculty', 'college_admin')
  @Get('books')
  async getBooks(@Query() query: BookQueryDto) {
    const result = await this.libraryService.getAllBooks(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('faculty', 'college_admin')
  @Post('books')
  async createBook(@Body() body: CreateBookDto) {
    const data = await this.libraryService.createBook(body);
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Get('books/:id')
  async getBook(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.libraryService.getBook(id);
    return ok(data);
  }
}
