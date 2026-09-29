import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Book } from '../../books/entities/book.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  category_id: number;

  @Column({ type: 'integer', nullable: true })
  category_parent_id: number | null;

  @Column({ type: 'varchar', length: 255 })
  category_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  category_slug: string;

  @Column({ type: 'text', nullable: true })
  category_description: string | null;

  @Column({ type: 'integer', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => Book, (book) => book.category)
  books: Book[];
}