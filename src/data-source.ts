import 'dotenv/config';

import { DataSource } from 'typeorm';

import { Category } from './categories/entities/category.entity';
import { Book } from './books/entities/book.entity';
import { BookAuthor } from './books/entities/book-author.entity';
import { Author } from './authors/entities/author.entity';
import { Role } from './roles/entities/role.entity';
import { User } from './users/entities/user.entity';
import { Copy } from './copies/entities/copy.entity';
import { Borrow } from './borrows/entities/borrow.entity';
import { Return } from './returns/entities/return.entity';
import { Fine } from './fines/entities/fine.entity';

export default new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [
    Category,
    Book,
    BookAuthor,
    Author,
    Role,
    User,
    Copy,
    Borrow,
    Return,
    Fine
  ],

  migrations: [
    'src/database/migrations/*.ts',
  ],
});