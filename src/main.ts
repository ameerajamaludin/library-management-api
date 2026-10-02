import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

import { ROLES_KEY } from './common/authorization/decorators/roles.decorator';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { UsersController } from './users/users.controller';
import { CategoriesController } from './categories/categories.controller';
import { AuthorsController } from './authors/authors.controller';
import { BooksController } from './books/books.controller';
import { CopiesController } from './copies/copies.controller';
import { BorrowsController } from './borrows/borrows.controller';
import { ReturnsController } from './returns/returns.controller';
import { FinesController } from './fines/fines.controller';

const GUARDED_CONTROLLERS: Function[] = [
  UsersController,
  CategoriesController,
  AuthorsController,
  BooksController,
  CopiesController,
  BorrowsController,
  ReturnsController,
  FinesController,
];

const MISSING_IDENTITY_RESPONSE = {
  description:
    'User-Id header is missing or does not match a known user. The role is always read from the database user record, never from request input.',
};

// The Permission Matrix is the source of truth for who may call
// what, and @Roles is the only place that mapping is declared.
// Reading it here keeps Swagger in step with the guards
// automatically, so an endpoint cannot be documented with one
// set of roles while the guard enforces another.
function documentRoleAndErrorResponses(
  document: OpenAPIObject,
): void {
  const rolesByOperationId = new Map<string, string[]>();

  for (const controller of GUARDED_CONTROLLERS) {
    for (const handler of Object.getOwnPropertyNames(
      controller.prototype,
    )) {
      if (handler === 'constructor') {
        continue;
      }

      const roles = Reflect.getMetadata(
        ROLES_KEY,
        controller.prototype[handler],
      );

      if (Array.isArray(roles)) {
        rolesByOperationId.set(
          `${controller.name}_${handler}`,
          roles,
        );
      }
    }
  }

  for (const paths of Object.values(document.paths)) {
    for (const operation of Object.values(paths)) {
      if (!operation || typeof operation !== 'object') {
        continue;
      }

      const roles = rolesByOperationId.get(
        String(operation.operationId ?? ''),
      );

      if (!roles || roles.length === 0) {
        continue;
      }

      const roleList = roles.join(', ');

      operation.description = [
        operation.description ?? '',
        `**Required roles:** ${roleList}.`,
      ]
        .filter(Boolean)
        .join('\n\n');

      const responses = operation.responses ?? {};

      if (!responses['401']) {
        responses['401'] = { ...MISSING_IDENTITY_RESPONSE };
      }

      if (!responses['403']) {
        responses['403'] = {
          description: `Requires one of the following roles: ${roleList}.`,
        };
      }

      operation.responses = responses;
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Unexpected failures are logged and returned as a single
  // 500 shape; every HttpException the guards, services and
  // ValidationPipe raise keeps its own status and body.
  app.useGlobalFilters(
    new AllExceptionsFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription(
      'API for managing books, members, borrowing, returns, overdue tracking, and fines.',
    )
    .setVersion('1.0')
    .addTag('Users')
    .addTag('Categories')
    .addTag('Authors')
    .addTag('Books')
    .addTag('Copies')
    .addTag('Borrows')
    .addTag('Returns')
    .addTag('Fines')
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  // Every endpoint is behind UserIdGuard and RolesGuard, so the
  // 401/403 outcomes and the required roles are the same for all
  // of them and are derived from each handler's @Roles metadata
  // rather than repeated per controller.
  documentRoleAndErrorResponses(document);

  // Swagger UI does not reliably render operations in document
  // order, so the Users, Authors, Books, Fines and Borrows
  // operations are pinned explicitly. The comparator MUST be
  // self-contained: Nest serialises it into the Swagger UI page as
  // function source, so it cannot reference any variable from this
  // file's scope. Anything outside the list returns 0, which leaves
  // every other module's order unchanged.
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      operationsSorter: (
        first: any,
        second: any,
      ) => {
        const order: Record<string, number> = {
          'get /users': 1,
          'get /users/{id}': 2,
          'get /users/overdue': 3,
          'get /users/active-borrows': 4,
          'get /users/active-fines': 5,
          'post /users': 6,
          'patch /users/{id}': 7,
          'delete /users/{id}': 8,
          'get /authors': 9,
          'get /authors/{id}': 10,
          'get /authors/{id}/books': 11,
          'patch /authors/{id}': 12,
          'get /books': 13,
          'get /books/{id}': 14,
          'get /books/status/{status}': 15,
          'post /books': 16,
          'post /books/{id}/copies': 17,
          'patch /books/{id}': 18,
          'delete /books/{id}': 19,
          'get /fines': 20,
          'get /fines/borrow/{borrowId}': 21,
          'get /fines/{id}': 22,
          'post /fines/overdue/{borrowId}': 23,
          'patch /fines/{id}': 24,
          'delete /fines/{id}': 25,
          'post /fines/{id}/pay': 26,
          'get /borrows/own': 27,
          'get /borrows': 28,
          'get /borrows/overdue': 29,
          'get /borrows/{borrowId}': 30,
          'post /borrows': 31,
          'post /borrows/copy/{copyId}/return': 32,
        };

        const rank = (operation: any) => {
          const path =
            typeof operation?.get === 'function'
              ? operation.get('path')
              : operation?.path;

          const method =
            typeof operation?.get === 'function'
              ? operation.get('method')
              : operation?.method;

          if (
            typeof path !== 'string' ||
            typeof method !== 'string'
          ) {
            return undefined;
          }

          const normalizedPath = path.replace(
            /:(\w+)/g,
            '{$1}',
          );

          return order[
            method.toLowerCase() +
              ' ' +
              normalizedPath
          ];
        };

        const firstRank = rank(first);
        const secondRank = rank(second);

        if (
          firstRank === undefined ||
          secondRank === undefined
        ) {
          return 0;
        }

        return firstRank - secondRank;
      },
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
