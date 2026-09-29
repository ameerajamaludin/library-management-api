import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { Book } from '../../books/entities/book.entity';

@Entity('copies')
export class Copy {
  @ApiProperty({
    example: 1,
  })
  @PrimaryGeneratedColumn()
  copy_id: number;

  @ApiProperty({
    example: 'OL514625W',
  })
  @Column({ type: 'varchar', length: 255 })
  openlibrary_work_id: string;

  @ApiProperty({
    example: 'BC000001',
  })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  barcode: string;

  @ApiProperty({
    example: 'AVAILABLE',
    description: 'Current status of the physical copy',
  })
  @Column({
    type: 'varchar',
    length: 50,
  })
  status: string;

  @ManyToOne(() => Book, (book) => book.copies)
  @JoinColumn({
    name: 'openlibrary_work_id',
  })
  book: Book;
}