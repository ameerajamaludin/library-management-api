import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';

import { Category } from '../../categories/entities/category.entity';
import { Copy } from '../../copies/entities/copy.entity';

@Entity('books')
export class Book {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  openlibrary_work_id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'integer', nullable: true })
  published_month: number | null;

  @Column({ type: 'integer', nullable: true })
  published_year: number | null;

  @Column({ type: 'integer' })
  category_id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fiction_nonfiction: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  isbn: string | null;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE', })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  cover_image_small: string | null;

  @Column({ type: 'varchar', nullable: true })
  cover_image_medium: string | null;

  @Column({ type: 'varchar', nullable: true })
  cover_image_large: string | null;

  @Column({
  type: 'varchar',
  length: 50,
  nullable: true,
})
updated_by: string | null;

@Column({
  type: 'timestamp',
  nullable: true,
})
updated_at: Date | null;

  @ManyToOne(() => Category, (category) => category.books)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Copy, (copy) => copy.book)
  copies: Copy[];
}