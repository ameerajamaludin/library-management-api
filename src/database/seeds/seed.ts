import 'dotenv/config';

import path from 'path';
import { DataSource } from 'typeorm';

import dataSource from '../../data-source';
import { readCsv } from './csv-reader';

import { Role } from '../../roles/entities/role.entity';
import { Category } from '../../categories/entities/category.entity';
import { Author } from '../../authors/entities/author.entity';
import { Book } from '../../books/entities/book.entity';
import { BookAuthor } from '../../books/entities/book-author.entity';
import { User } from '../../users/entities/user.entity';
import { Copy } from '../../copies/entities/copy.entity';

function toNullableInteger(value: string | undefined): number | null {
  if (!value || value.trim() === '') {
    return null;
  }

  const number = Number(value);

  return Number.isInteger(number) ? number : null;
}


// ========================================
// ROLES
// ========================================

interface RoleCsv {
  role_id: string;
  role_name: string;
}

async function seedRoles(dataSource: DataSource) {
  const repository = dataSource.getRepository(Role);

  const rows = readCsv<RoleCsv>(
    path.join(process.cwd(), 'data', 'roles.csv'),
  );

  for (const row of rows) {
    await repository.save({
      role_id: Number(row.role_id),
      role_name: row.role_name,
    });
  }

  console.log(`Imported ${rows.length} roles`);
}


// ========================================
// CATEGORIES
// ========================================

interface CategoryCsv {
  category_id: string;
  category_parent_id: string;
  category_name: string;
  category_slug: string;
  category_description: string;
  sort_order: string;
  is_active: string;
}

async function seedCategories(dataSource: DataSource) {
  const repository = dataSource.getRepository(Category);

  const rows = readCsv<CategoryCsv>(
    path.join(process.cwd(), 'data', 'categories.csv'),
  );

  for (const row of rows) {
    await repository.save({
      category_id: Number(row.category_id),

      category_parent_id:
        row.category_parent_id === ''
          ? null
          : Number(row.category_parent_id),

      category_name: row.category_name,
      category_slug: row.category_slug,

      category_description:
        row.category_description === ''
          ? null
          : row.category_description,

      sort_order: Number(row.sort_order),

      is_active: row.is_active.toLowerCase() === 'true',
    });
  }

  console.log(`Imported ${rows.length} categories`);
}


// ========================================
// AUTHORS
// ========================================

interface AuthorCsv {
  openlibrary_work_id: string;
  author_id: string;
  author_name: string;
}

async function seedAuthors(dataSource: DataSource) {
  const repository = dataSource.getRepository(Author);

  const rows = readCsv<AuthorCsv>(
    path.join(process.cwd(), 'data', 'authors.csv'),
  );

  const uniqueAuthors = new Map<string, string>();

  for (const row of rows) {
    uniqueAuthors.set(row.author_id, row.author_name);
  }

  for (const [author_id, author_name] of uniqueAuthors) {
    await repository.save({
      author_id,
      author_name,
    });
  }

  console.log(`Imported ${uniqueAuthors.size} authors`);
}


// ========================================
// BOOKS
// ========================================

interface BookCsv {
  openlibrary_work_id: string;
  title: string;
  description: string;
  published_month: string;
  published_year: string;
  category_id: string;

  category_parent_id: string;
  category_name: string;
  category_parent_name: string;
  category_slug: string;

  fiction_nonfiction: string;
  isbn: string;
  cover_image_small: string;
  cover_image_medium: string;
  cover_image_large: string;
}

async function seedBooks(dataSource: DataSource) {
  const repository = dataSource.getRepository(Book);

  const rows = readCsv<BookCsv>(
    path.join(process.cwd(), 'data', 'books.csv'),
  );

  for (const row of rows) {
    await repository.save({
      openlibrary_work_id: row.openlibrary_work_id,
      title: row.title,

      description:
        row.description === ''
          ? null
          : row.description,

      published_month: toNullableInteger(row.published_month),
      published_year: toNullableInteger(row.published_year),

      category_id: Number(row.category_id),

      fiction_nonfiction:
        row.fiction_nonfiction === ''
          ? null
          : row.fiction_nonfiction,

      isbn:
        row.isbn === ''
          ? null
          : row.isbn,

      cover_image_small:
        row.cover_image_small === ''
          ? null
          : row.cover_image_small,

      cover_image_medium:
        row.cover_image_medium === ''
          ? null
          : row.cover_image_medium,

      cover_image_large:
        row.cover_image_large === ''
          ? null
          : row.cover_image_large,
    });
  }

  console.log(`Imported ${rows.length} books`);
}


// ========================================
// USERS
// ========================================

interface UserCsv {
  user_id: string;
  name: string;
  email: string;
  role_id: string;
}

async function seedUsers(dataSource: DataSource) {
  const repository = dataSource.getRepository(User);

  const rows = readCsv<UserCsv>(
    path.join(process.cwd(), 'data', 'users.csv'),
  );

  for (const row of rows) {
    await repository.save({
      user_id: row.user_id,
      name: row.name,
      email: row.email,
      role_id: Number(row.role_id),
    });
  }

  console.log(`Imported ${rows.length} users`);
}


// ========================================
// COPIES
// ========================================

interface CopyCsv {
  copy_id: string;
  openlibrary_work_id: string;
  barcode: string;
  status: string;
}

async function seedCopies(dataSource: DataSource) {
  const repository = dataSource.getRepository(Copy);

  const rows = readCsv<CopyCsv>(
    path.join(process.cwd(), 'data', 'copies.csv'),
  );

  for (const row of rows) {
    await repository.save({
      copy_id: Number(row.copy_id),
      openlibrary_work_id: row.openlibrary_work_id,
      barcode: row.barcode,
      status: row.status,
    });
  }

  console.log(`Imported ${rows.length} copies`);
}


// ========================================
// BOOK AUTHORS
// ========================================

async function seedBookAuthors(dataSource: DataSource) {
  const repository = dataSource.getRepository(BookAuthor);

  const rows = readCsv<AuthorCsv>(
    path.join(process.cwd(), 'data', 'authors.csv'),
  );

  for (const row of rows) {
    await repository.save({
      openlibrary_work_id: row.openlibrary_work_id,
      author_id: row.author_id,
    });
  }

  console.log(`Imported ${rows.length} book-author relationships`);
}


// ========================================
// MAIN
// ========================================

async function main() {
  await dataSource.initialize();

  console.log('Database connected');
  console.log('Starting seed...');

  await seedRoles(dataSource);
  await seedCategories(dataSource);
  await seedAuthors(dataSource);
  await seedBooks(dataSource);
  await seedUsers(dataSource);
  await seedCopies(dataSource);
  await seedBookAuthors(dataSource);

  console.log('Seed completed successfully');

  await dataSource.destroy();
}

main().catch(async (error) => {
  console.error('Seed failed:', error);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});