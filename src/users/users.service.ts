import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Borrow)
    private readonly borrowsRepository: Repository<Borrow>,
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

  async findByIdForAuthorization(id: string) {
    return this.usersRepository.findOne({
      where: {
        user_id: id,
      },
      relations: {
        role: true,
      },
    });
  }

  async findOne(
    id: string,
    requesterUserId?: string,
    requesterRole?: string,
  ) {
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
          },
        },
      });

    if (!user) {
      throw new NotFoundException(
        `User ${id} not found`,
      );
    }

    if (
      requesterRole?.toUpperCase() === 'MEMBER' &&
      requesterUserId !== id
    ) {
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
        }),
      ),
    };
  }
  async findOverdue(
    id: string,
    requesterUserId?: string,
    requesterRole?: string,
  ) {
    if (
      requesterRole?.toUpperCase() === 'MEMBER' &&
      requesterUserId !== id
    ) {
      throw new NotFoundException(
        `User ${id} not found`,
      );
    }

    const user = await this.usersRepository.findOne({
      where: { user_id: id },
    });

    if (!user) {
      throw new NotFoundException(
        `User ${id} not found`,
      );
    }

    const borrows = await this.borrowsRepository.find({
      where: {
        user_id: id,
        returned_at: IsNull(),
        due_at: LessThan(new Date()),
      },
      relations: {
        copy: {
          book: true,
        },
      },
      order: {
        due_at: 'ASC',
      },
    });

    return borrows.map((borrow) => ({
      borrow_id: borrow.borrow_id,
      copy_id: borrow.copy_id,
      copy: {
        copy_id: borrow.copy.copy_id,
        barcode: borrow.copy.barcode,
        status: borrow.copy.status,
      },
      book: {
        openlibrary_work_id: borrow.copy.book.openlibrary_work_id,
        title: borrow.copy.book.title,
        isbn: borrow.copy.book.isbn,
      },
      borrowed_at: borrow.borrowed_at,
      due_at: borrow.due_at,
      returned_at: borrow.returned_at,
    }));
  }

}