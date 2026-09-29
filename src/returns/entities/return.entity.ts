import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Borrow } from '../../borrows/entities/borrow.entity';

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn()
  return_id: number;

  @Column({
    type: 'integer',
  })
  borrow_id: number;

  @Column({
    type: 'timestamp',
  })
  returned_at: Date;

  @Column({
    type: 'varchar',
    length: 50,
  })
  condition: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string | null;

  @OneToOne(() => Borrow)
  @JoinColumn({
    name: 'borrow_id',
  })
  borrow: Borrow;
}