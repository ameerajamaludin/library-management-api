import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Copy } from './entities/copy.entity';
import { Book } from '../books/entities/book.entity';

@Injectable()
export class CopiesService {
  constructor(
    @InjectRepository(Copy)
    private readonly copiesRepository: Repository<Copy>,

    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

async findByBook(openlibraryWorkId: string) {
  const book = await this.booksRepository.findOne({
    where: {
      openlibrary_work_id: openlibraryWorkId,
    },
  });

  if (!book) {
    throw new NotFoundException(
      `Book ${openlibraryWorkId} not found`,
    );
  }

  const copies = await this.copiesRepository.find({
    where: {
      openlibrary_work_id: openlibraryWorkId,
    },
    order: {
      copy_id: 'ASC',
    },
  });

  const totalCopies = copies.length;

  const availableCopies = copies.filter(
    (copy) => copy.status === 'AVAILABLE',
  ).length;

  return {
    book: {
      openlibrary_work_id: book.openlibrary_work_id,
      title: book.title,
    },
    totalCopies,
    availableCopies,
    copies,
  };
}

  async create(
    openlibraryWorkId: string,
    barcode: string,
    status: string,
  ): Promise<Copy> {
    const book = await this.booksRepository.findOne({
      where: {
        openlibrary_work_id: openlibraryWorkId,
      },
    });

    if (!book) {
      throw new NotFoundException(
        `Book ${openlibraryWorkId} not found`,
      );
    }

    const copy = this.copiesRepository.create({
      openlibrary_work_id: openlibraryWorkId,
      barcode,
      status,
    });

    return this.copiesRepository.save(copy);
  }

  async update(
    copyId: number,
    status: string,
  ): Promise<Copy> {
    const copy = await this.copiesRepository.findOne({
      where: {
        copy_id: copyId,
      },
    });

    if (!copy) {
      throw new NotFoundException(
        `Copy ${copyId} not found`,
      );
    }

    copy.status = status;

    return this.copiesRepository.save(copy);
  }
}