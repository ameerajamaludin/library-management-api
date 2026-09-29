import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesModule } from './categories/categories.module';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { CopiesModule } from './copies/copies.module';
import { BorrowsModule } from './borrows/borrows.module';
import { ReturnsModule } from './returns/returns.module';
import { FinesModule } from './fines/fines.module';
import { AuthorizationModule } from './common/authorization/authorization.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    CategoriesModule,
    BooksModule,
    AuthorsModule,
    RolesModule,
    UsersModule,
    CopiesModule,
    BorrowsModule,
    ReturnsModule,
    FinesModule,
    AuthorizationModule,
  ],
})
export class AppModule {}