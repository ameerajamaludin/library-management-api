import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Borrow } from '../../borrows/entities/borrow.entity';

@Entity('fines')
export class Fine {
  @PrimaryGeneratedColumn()
  fine_id: number;

  @Column({
    type: 'integer',
  })
  borrow_id: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  reason: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  status: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  paid_at: Date | null;

  @ManyToOne(() => Borrow)
  @JoinColumn({
    name: 'borrow_id',
  })
  borrow: Borrow;
}