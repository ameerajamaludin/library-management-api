import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: {
        role: true,
      },

      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const user =
      await this.usersRepository.findOne({
        where: {
          user_id: id,
        },

        relations: {
          role: true,

          borrows: {
            copy: {
              book: true,
            },
            returnRecord: true,
            fines: true,
          },
        },
      });

    if (!user) {
      throw new NotFoundException(
        `User ${id} not found`,
      );
    }

    return {
      user_id: user.user_id,
      name: user.name,
      email: user.email,

      role_id: user.role_id,

      role: user.role,

      borrows: user.borrows.map(
        (borrow) => ({
          borrow_id:
            borrow.borrow_id,

          copy_id:
            borrow.copy_id,

          copy: {
            copy_id:
              borrow.copy.copy_id,

            barcode:
              borrow.copy.barcode,

            status:
              borrow.copy.status,
          },

          book: {
            openlibrary_work_id:
              borrow.copy.book
                .openlibrary_work_id,

            title:
              borrow.copy.book.title,

            isbn:
              borrow.copy.book.isbn,
          },

          borrowed_at:
            borrow.borrowed_at,

          due_at:
            borrow.due_at,

          returned_at:
            borrow.returned_at,

          returnRecord:
            borrow.returnRecord
              ? {
                  return_id:
                    borrow.returnRecord
                      .return_id,

                  borrow_id:
                    borrow.returnRecord
                      .borrow_id,

                  returned_at:
                    borrow.returnRecord
                      .returned_at,

                  condition:
                    borrow.returnRecord
                      .condition,

                  notes:
                    borrow.returnRecord
                      .notes,
                }
              : null,

          fines:
            (borrow.fines ?? []).map(
              (fine) => ({
                fine_id:
                  fine.fine_id,

                amount:
                  fine.amount,

                reason:
                  fine.reason,

                status:
                  fine.status,

                paid_at:
                  fine.paid_at,
              }),
            ),
        }),
      ),
    };
  }
}
