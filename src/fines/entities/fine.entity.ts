import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Borrow } from '../../borrows/entities/borrow.entity';
import { User } from '../../users/entities/user.entity';

@Entity('fines')
export class Fine {
  @PrimaryGeneratedColumn()
  fine_id: number;

  @Column({
    type: 'integer',
    unique: true,
  })
  borrow_id: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  // The completed 24-hour periods the amount was
  // calculated from, so a fine always explains
  // itself: amount = overdue_days x RM2.
  @Column({
    type: 'integer',
    default: 0,
  })
  overdue_days: number;

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

  // The library user who settled the fine, kept as an
  // audit trail. Deliberately not a foreign key so
  // removing a user can never fail because of the
  // payments they recorded.
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paid_by: string | null;

  // The payer profile is loaded alongside the stored
  // ID so responses can show who settled the fine. The
  // ID in paid_by is kept even if this user is later
  // deleted, so the payment history survives.
  @ManyToOne(() => User)
  @JoinColumn({
    name: 'paid_by',
  })
  paidBy: User;

  @ManyToOne(() => Borrow)
  @JoinColumn({
    name: 'borrow_id',
  })
  borrow: Borrow;
}