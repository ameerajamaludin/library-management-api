import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Copy } from '../../copies/entities/copy.entity';
import { Return } from '../../returns/entities/return.entity';
import { Fine } from '../../fines/entities/fine.entity';

@Entity('borrows')
export class Borrow {
  @PrimaryGeneratedColumn()
  borrow_id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  user_id: string;

  @Column({
    type: 'integer',
  })
  copy_id: number;

  @Column({
    type: 'timestamp',
  })
  borrowed_at: Date;

  @Column({
    type: 'timestamp',
  })
  due_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  returned_at: Date | null;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @ManyToOne(() => Copy)
  @JoinColumn({
    name: 'copy_id',
  })
  copy: Copy;

  @OneToOne(() => Return, (returnRecord) => returnRecord.borrow)
  returnRecord: Return;

  @OneToMany(() => Fine, (fine) => fine.borrow)
  fines: Fine[];
}