import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Book } from '../../books/entities/book.entity';
import { Borrow } from '../../borrows/entities/borrow.entity';

@Entity('copies')
export class Copy {
  @PrimaryGeneratedColumn()
  copy_id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  openlibrary_work_id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  barcode: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  status: string;

@ManyToOne( () => Book, (book) => book.copies,{
  onUpdate: 'CASCADE',
},
)
@JoinColumn({
  name: 'openlibrary_work_id',
})
book: Book;

  @OneToMany(() => Borrow, (borrow) => borrow.copy)
  borrows: Borrow[];
}