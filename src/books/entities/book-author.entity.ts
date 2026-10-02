import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { Book } from './book.entity';
import { Author } from '../../authors/entities/author.entity';

@Entity('book_authors')
export class BookAuthor {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  openlibrary_work_id: string;

  @PrimaryColumn({ type: 'varchar', length: 255 })
  author_id: string;

@ManyToOne(
  () => Book,
  {
    onUpdate: 'CASCADE',
  },
)
@JoinColumn({
  name: 'openlibrary_work_id',
})
book: Book;

  @ManyToOne(() => Author)
  @JoinColumn({
    name: 'author_id',
  })
  author: Author;
}