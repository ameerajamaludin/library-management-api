import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Not, Raw, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { Borrow } from '../borrows/entities/borrow.entity';
import { Fine } from '../fines/entities/fine.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { overdueCutoff } from '../common/overdue-days.util';
import { UserListItemResponseDto } from './dto/user-list-response.dto';

// Postgres returns the EXISTS subqueries as real booleans,
// but a driver that hands back the raw text form is coerced
// too so a flag is never the string "false", which is truthy.
function toBooleanFlag(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.toLowerCase() === 't' || value.toLowerCase() === 'true';
  }

  return Boolean(value);
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Borrow)
    private readonly borrowsRepository: Repository<Borrow>,

    @InjectRepository(Fine)
    private readonly finesRepository: Repository<Fine>,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<User> {
    const existingUser =
      await this.usersRepository.findOne({
        where: {
          user_id: createUserDto.user_id,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        `User ${createUserDto.user_id} already exists`,
      );
    }

    if (createUserDto.email !== undefined) {
      const existingEmail =
        await this.usersRepository.findOne({
          where: {
            email: createUserDto.email,
          },
        });

      if (existingEmail) {
        throw new ConflictException(
          `Email ${createUserDto.email} is already in use`,
        );
      }
    }

    const user =
      this.usersRepository.create(
        createUserDto,
      );

    return this.usersRepository.save(user);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user =
      await this.usersRepository.findOne({
        where: {
          user_id: id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        `User ${id} not found`,
      );
    }

    if (updateUserDto.email !== undefined) {
      const existingEmail =
        await this.usersRepository.findOne({
          where: {
            email: updateUserDto.email,
          },
        });

      if (
        existingEmail &&
        existingEmail.user_id !== id
      ) {
        throw new ConflictException(
          `Email ${updateUserDto.email} is already in use`,
        );
      }
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.email !== undefined) {
      user.email = updateUserDto.email;
    }

    if (updateUserDto.role_id !== undefined) {
      user.role_id = updateUserDto.role_id;
    }

    return this.usersRepository.save(user);
  }

  async deleteUser(id: string) {
    const user =
      await this.usersRepository.findOne({
        where: {
          user_id: id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        `User ${id} not found`,
      );
    }

    await this.usersRepository.remove(user);

    return {
      message: `User ${id} deleted successfully`,
    };
  }

  // The status flags are resolved with correlated EXISTS
  // subqueries on the single users query rather than a
  // lookup per user, so listing every user stays one
  // round trip instead of an N+1. EXISTS stops at the first
  // match, and because `role` is a many-to-one the join
  // cannot multiply rows, so raw and entities stay aligned.
  async findAll(): Promise<UserListItemResponseDto[]> {
    const { entities, raw } =
      await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .addSelect(
          `EXISTS (
             SELECT 1
             FROM borrows active_borrow
             WHERE active_borrow.user_id = "user"."user_id"
               AND active_borrow.returned_at IS NULL
           )`,
          'has_active_borrow',
        )
        .addSelect(
          `EXISTS (
             SELECT 1
             FROM borrows overdue_borrow
             WHERE overdue_borrow.user_id = "user"."user_id"
               AND overdue_borrow.returned_at IS NULL
               AND overdue_borrow.due_at < :overdueCutoff
           )`,
          'has_overdue_book',
        )
        .addSelect(
          `EXISTS (
             SELECT 1
             FROM borrows fined_borrow
             INNER JOIN fines ON fines.borrow_id = fined_borrow.borrow_id
             WHERE fined_borrow.user_id = "user"."user_id"
               AND fines.status <> 'PAID'
           )`,
          'has_active_fine',
        )
        .setParameter('overdueCutoff', overdueCutoff())
        .orderBy('user.name', 'ASC')
        .getRawAndEntities();

    // Raw rows are keyed by user_id rather than trusted to
    // line up with the entities, so a future join that does
    // multiply rows cannot silently attach the wrong flags
    // to a user.
    const flagsByUserId = new Map(
      raw.map((row) => [
        row.user_user_id,
        {
          has_active_borrow: toBooleanFlag(row.has_active_borrow),
          has_active_fine: toBooleanFlag(row.has_active_fine),
          has_overdue_book: toBooleanFlag(row.has_overdue_book),
        },
      ]),
    );

    return entities.map((user) => {
      const flags = flagsByUserId.get(user.user_id);

      return {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role: {
          role_id: user.role.role_id,
          role_name: user.role.role_name,
        },

        has_active_borrow: flags?.has_active_borrow ?? false,
        has_active_fine: flags?.has_active_fine ?? false,
        has_overdue_book: flags?.has_overdue_book ?? false,
      };
    });
  }

async findByIdForAuthorization(id: string) {
  return this.usersRepository.findOne({
    where: {
      user_id: Raw(
        (alias) => `LOWER(${alias}) = LOWER(:userId)`,
        { userId: id },
      ),
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
    const relations = {
      role: true,

      borrows: {
        copy: {
          book: true,
        },
      },
    };

    const user =
      await this.usersRepository.findOne({
        where: {
          user_id: id,
        },

        relations,
      });

    if (user) {
      return this.toUserResponse(user);
    }

    const users =
      await this.usersRepository.find({
        where: {
          name: Raw(
            (alias) => `LOWER(${alias}) LIKE LOWER(:name)`,
            { name: `%${id}%` },
          ),
        },

        relations,

        order: {
          user_id: 'ASC',
        },
      });

    if (users.length === 0) {
      throw new NotFoundException(
        `User ${id} not found`,
      );
    }

    return users.map(
      (namedUser) =>
        this.toUserResponse(namedUser),
    );
  }

  private toUserResponse(user: User) {
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
  // ==========================================
  // GET /users/active-borrows
  // ==========================================

  // A borrow counts as active while its return has not been
  // recorded, the same `returned_at IS NULL` predicate the
  // has_active_borrow flag on GET /users uses, so the list and
  // the flag cannot disagree.
  async findUsersWithActiveBorrows() {
    const activeBorrows =
      await this.borrowsRepository.find({
        where: {
          returned_at: IsNull(),
        },

        relations: {
          user: true,
        },

        order: {
          borrowed_at: 'ASC',
        },
      });

    return this.groupActiveRowsByUser(activeBorrows);
  }

  // A fine is settled once its status is PAID, the same
  // terminal status fines.service applies when a fine is
  // paid and GET /users uses for has_active_fine. The user
  // is reached through the fine's borrow, which is loaded in
  // the same query rather than looked up per fine.
  async findUsersWithActiveFines() {
    const activeFines =
      await this.finesRepository.find({
        where: {
          status: Not('PAID'),
        },

        relations: {
          borrow: {
            user: true,
          },
        },

        order: {
          fine_id: 'ASC',
        },
      });

    return this.groupActiveRowsByUser(
      activeFines.map((fine) => fine.borrow),
    );
  }

  // Collects the users behind a set of active rows into one
  // entry per user. The rows already carry their user, so a
  // single query backs each list and no user is fetched
  // twice. Only summary counts are exposed, never the
  // borrow or fine detail itself.
  private groupActiveRowsByUser(
    rows: { user: User }[],
  ) {
    const usersById = new Map<
      string,
      {
        user_id: string;
        name: string;
        email: string;
        activeCount: number;
      }
    >();

    for (const row of rows) {
      const existing =
        usersById.get(row.user.user_id);

      if (existing) {
        existing.activeCount += 1;
      } else {
        usersById.set(row.user.user_id, {
          user_id: row.user.user_id,
          name: row.user.name,
          email: row.user.email,
          activeCount: 1,
        });
      }
    }

    return Array.from(usersById.values());
  }

  async findUsersWithOverdue() {
    // A Borrow becomes overdue 1 calendar day after
    // its due date, so only borrows past that cutoff
    // count as overdue.
    const overdueCutoffDate = overdueCutoff();

    const overdueBorrows =
      await this.borrowsRepository.find({
        where: {
          returned_at: IsNull(),
          due_at: LessThan(overdueCutoffDate),
        },

        relations: {
          user: true,
        },

        order: {
          due_at: 'ASC',
        },
      });

    const usersById = new Map<
      string,
      {
        user_id: string;
        name: string;
        email: string;
        overdueBorrowCount: number;
      }
    >();

    for (const borrow of overdueBorrows) {
      const existing =
        usersById.get(borrow.user_id);

      if (existing) {
        existing.overdueBorrowCount += 1;
      } else {
        usersById.set(borrow.user_id, {
          user_id: borrow.user.user_id,
          name: borrow.user.name,
          email: borrow.user.email,
          overdueBorrowCount: 1,
        });
      }
    }

    return Array.from(usersById.values());
  }

}