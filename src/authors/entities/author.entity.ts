import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { BookAuthor } from '../../books/entities/book-author.entity';

@Entity('authors')
export class Author {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  author_id: string;

  @Column({ type: 'varchar', length: 255 })
  author_name: string;

  @OneToMany(() => BookAuthor, (bookAuthor) => bookAuthor.author)
  bookAuthors: BookAuthor[];
}