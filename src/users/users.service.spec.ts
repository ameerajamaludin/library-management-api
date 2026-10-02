import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Borrow } from '../borrows/entities/borrow.entity';
import { RolesGuard } from '../common/authorization/guards/roles.guard';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// findAll resolves the three flags in a single query, so the
// builder is mocked and the rows the database would return
// are handed back directly.
function createQueryBuilderMock(result: {
  entities: unknown[];
  raw: Record<string, unknown>[];
}) {
  return {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawAndEntities: jest.fn().mockResolvedValue(result),
  };
}

function createUser(
  overrides: Record<string, unknown> = {},
) {
  return {
    user_id: 'L001',
    name: 'Aminah binti Hassan',
    email: 'aminah@perpustakaan.com',
    role_id: 1,
    role: { role_id: 1, role_name: 'ADMIN' },
    ...overrides,
  };
}

describe('UsersService.findAll status flags', () => {
  let service: UsersService;
  let usersRepository: { createQueryBuilder: jest.Mock };

  const setQueryResult = (result: {
    entities: unknown[];
    raw: Record<string, unknown>[];
  }) => {
    const builder =
      createQueryBuilderMock(result);

    usersRepository.createQueryBuilder.mockReturnValue(
      builder,
    );

    return builder;
  };

  beforeEach(async () => {
    usersRepository = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          UsersService,
          {
            provide: getRepositoryToken(User),
            useValue: usersRepository,
          },
          {
            provide: getRepositoryToken(Borrow),
            useValue: {},
          },
        ],
      }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('reports every flag true for an overdue borrow with an unpaid fine', async () => {
    setQueryResult({
      entities: [createUser()],
      raw: [
        {
          raw_user_id: 'L001',
          has_active_borrow: true,
          has_active_fine: true,
          has_overdue_book: true,
        },
      ],
    });

    const [user] = await service.findAll();

    expect(user).toMatchObject({
      user_id: 'L001',
      has_active_borrow: true,
      has_active_fine: true,
      has_overdue_book: true,
    });
  });

  it('reports every flag false for a user with no borrows and no fines', async () => {
    setQueryResult({
      entities: [createUser()],
      raw: [
        {
          raw_user_id: 'L001',
          has_active_borrow: false,
          has_active_fine: false,
          has_overdue_book: false,
        },
      ],
    });

    const [user] = await service.findAll();

    expect(user.has_active_borrow).toBe(false);
    expect(user.has_active_fine).toBe(false);
    expect(user.has_overdue_book).toBe(false);
  });

  it('treats a fine as active only while it is not PAID', async () => {
    const builder = setQueryResult({
      entities: [createUser()],
      raw: [
        {
          raw_user_id: 'L001',
          has_active_borrow: false,
          has_active_fine: false,
          has_overdue_book: false,
        },
      ],
    });

    await service.findAll();

    const activeFineSql = builder.addSelect.mock.calls.find(
      (call) => call[1] === 'has_active_fine',
    )?.[0] as string;

    expect(activeFineSql).toContain(
      "fines.status <> 'PAID'",
    );
    expect(activeFineSql).toContain(
      'fines.borrow_id = fined_borrow.borrow_id',
    );
  });

  it('counts a borrow as overdue only while unreturned and past the cutoff', async () => {
    const builder = setQueryResult({
      entities: [createUser()],
      raw: [
        {
          raw_user_id: 'L001',
          has_active_borrow: false,
          has_active_fine: false,
          has_overdue_book: false,
        },
      ],
    });

    await service.findAll();

    const overdueSql = builder.addSelect.mock.calls.find(
      (call) => call[1] === 'has_overdue_book',
    )?.[0] as string;

    expect(overdueSql).toContain(
      'returned_at IS NULL',
    );
    expect(overdueSql).toContain(
      'due_at < :overdueCutoff',
    );

    // The cutoff must be exactly one calendar day before
    // now, the same rule GET /users/:id/overdue uses, so the
    // flag cannot disagree with that endpoint.
    const cutoff = builder.setParameter.mock.calls.find(
      (call) => call[0] === 'overdueCutoff',
    )?.[1] as Date;

    const oneDay = 1000 * 60 * 60 * 24;

    expect(
      Math.abs(
        Date.now() - cutoff.getTime() - oneDay,
      ),
    ).toBeLessThan(1000);
  });

  it('resolves every user with one query instead of one query per user', async () => {
    const builder = setQueryResult({
      entities: [
        createUser({ user_id: 'L001' }),
        createUser({ user_id: 'L002' }),
        createUser({ user_id: 'L003' }),
      ],
      raw: [
        {
          raw_user_id: 'L001',
          has_active_borrow: true,
          has_active_fine: false,
          has_overdue_book: true,
        },
        {
          raw_user_id: 'L002',
          has_active_borrow: false,
          has_active_fine: true,
          has_overdue_book: false,
        },
        {
          raw_user_id: 'L003',
          has_active_borrow: false,
          has_active_fine: false,
          has_overdue_book: false,
        },
      ],
    });

    const users = await service.findAll();

    expect(
      usersRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(1);
    expect(
      builder.getRawAndEntities,
    ).toHaveBeenCalledTimes(1);
    expect(users).toHaveLength(3);

    expect(users[0]).toMatchObject({
      user_id: 'L001',
      has_active_borrow: true,
      has_active_fine: false,
      has_overdue_book: true,
    });
    expect(users[1]).toMatchObject({
      user_id: 'L002',
      has_active_borrow: false,
      has_active_fine: true,
      has_overdue_book: false,
    });
    expect(users[2]).toMatchObject({
      user_id: 'L003',
      has_active_borrow: false,
      has_active_fine: false,
      has_overdue_book: false,
    });
  });

  it('never reports a flag as the string "false", which would be truthy', async () => {
    setQueryResult({
      entities: [createUser()],
      raw: [
        {
          raw_user_id: 'L001',
          has_active_borrow: 't',
          has_active_fine: 'false',
          has_overdue_book: 'true',
        },
      ],
    });

    const [user] = await service.findAll();

    expect(user.has_active_borrow).toBe(true);
    expect(user.has_active_fine).toBe(false);
    expect(user.has_overdue_book).toBe(true);
  });

  it('keeps the existing user fields alongside the new flags', async () => {
    setQueryResult({
      entities: [createUser()],
      raw: [
        {
          raw_user_id: 'L001',
          has_active_borrow: false,
          has_active_fine: false,
          has_overdue_book: false,
        },
      ],
    });

    const [user] = await service.findAll();

    expect(user).toEqual({
      user_id: 'L001',
      name: 'Aminah binti Hassan',
      email: 'aminah@perpustakaan.com',
      role_id: 1,
      role: { role_id: 1, role_name: 'ADMIN' },
      has_active_borrow: false,
      has_active_fine: false,
      has_overdue_book: false,
    });
  });
});
describe('GET /users ADMIN access', () => {
  // The endpoint's @Roles('ADMIN') metadata is read through
  // the real guard, so these tests assert the access rule the
  // Permission Matrix states: only ADMIN may list users, and
  // so only ADMIN ever sees anyone else's status flags.
  //
  // The guard only reads the handler for its @Roles metadata
  // and never invokes it, so the real controller method is
  // passed as-is. It is pulled off the prototype through the
  // descriptor so this stays a genuine reference to the
  // decorated method the guard reads in production.
  const findAllHandler =
    Object.getOwnPropertyDescriptor(
      UsersController.prototype,
      'findAll',
    )?.value as unknown;

  const contextFor = (roleName: string) =>
    ({
      getHandler: () => findAllHandler,
      getClass: () => UsersController,
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: { role_name: roleName } },
        }),
      }),
    }) as unknown as ExecutionContext;

  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(new Reflector());
  });

  it('allows ADMIN to list users with the status flags', () => {
    expect(
      guard.canActivate(contextFor('ADMIN')),
    ).toBe(true);
  });

  it('blocks LIBRARIAN from listing other users and their flags', () => {
    expect(() =>
      guard.canActivate(contextFor('LIBRARIAN')),
    ).toThrow(ForbiddenException);
  });

  it('blocks MEMBER from listing other users and their flags', () => {
    expect(() =>
      guard.canActivate(contextFor('MEMBER')),
    ).toThrow(ForbiddenException);
  });
});
