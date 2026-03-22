import { Injectable } from '@nestjs/common';
import { LibraryRepository } from './library.repository';
import { BookQueryDto } from './dto/book-query.dto';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class LibraryService {
  constructor(private readonly repo: LibraryRepository) {}

  getAllBooks(query: BookQueryDto) {
    return this.repo.findMany(query);
  }

  getBook(id: string) {
    return this.repo.findById(id);
  }

  createBook(data: CreateBookDto) {
    return this.repo.create(data);
  }
}
