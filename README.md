# Library Management API

---

## Project Overview

A modern REST API for managing a library's books, physical copies, members, borrowing, returns, overdue tracking, and fines. The **Library Management API** provides core backend functionalities to support library cataloging, search, member records, and book issuing systems. 

- **Data Source:** Seeded using data harvested from the [Open Library Data Retrieval and Normalization](https://github.com/ameerajamaludin/openlibrary-data-retrieval-and-normalization) pipeline, curated and optimized down to a representative subset of **2,109 book records** for local development and testing.
> Project Goals: mainly to understand RDBMS and REST API

---
## Project Structure

```text
.
├── data/                   # CSV seed data
├── docs/
│   └── development-roadmap.md
├── src/                    # Application source
├── test/                   # End-to-end tests
├── .env.example
├── package.json
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.ts
└── README.md
```

---

## API Development Roadmap

The project is being developed incrementally.

| Phase | Area | Status |
|---|---|---|
| 1 | Project & database foundation | ✅ Completed  |
| 2 | Books & catalog API | ✅ Completed  |
| 3 | Authentication & authorization | ⬜ Planned |
| 4 | Borrowing | ⬜ Planned |
| 5 | Returns | ⬜ Planned |
| 6 | Overdue tracking | ⬜ Planned |
| 7 | Fines | ⬜ Planned |
| 8 | Reports | ⬜ Planned |
| 9 | Validation & error handling | ⬜ Planned |
| 10 | Testing | ⬜ Planned |
| 11 | API documentation | ⬜ Planned |
| 12 | Production readiness | ⬜ Planned |

For the complete roadmap and exit criteria, see [`docs/development-roadmap.md`](docs/development-roadmap.md).

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [NestJS](https://nestjs.com/) | Backend framework |
| TypeScript | Application language |
| PostgreSQL | Relational database |
| TypeORM | ORM and database migrations |
| Swagger / OpenAPI | API documentation |
| Jest | Testing |
| Supertest | HTTP / E2E testing |
| csv-parse | CSV dataset processing |

The project's package configuration and available development commands are defined in [`package.json`](package.json).

---
## Architecture

The API is structured around the main library domain:

```text
Library Management API
│
├── Books
│   ├── Authors
│   ├── Categories
│   └── Copies
│
├── Users
│   └── Roles
│
└── Borrowing
    ├── Returns
    ├── Overdue
    └── Fines
```

The planned database relationships are:

```text
categories
    │
    └── books
          │
          ├── copies
          │
          └── book_authors
                 │
                 └── authors

roles
    │
    └── users
          │
          └── borrows
                 │
                 ├── copies
                 ├── returns
                 └── fines
```

These relationships follow the project's development roadmap.

---

##  Getting Started (Local Setup)

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL
- Git

You can verify your installations with:

```bash
node --version
npm --version
psql --version
git --version
```

---

### 1. Clone the repository

```bash
git clone https://github.com/ameerajamaludin/library-management-api.git
cd library-management-api
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Create a PostgreSQL database

Create a local PostgreSQL database for the API.

For example:

```sql
CREATE DATABASE library_management;
```

You can also create a dedicated PostgreSQL user if preferred.

---

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=library_management
```

The application currently reads the PostgreSQL connection from:

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`

The TypeORM configuration uses these variables for both the application and migration data source.

> **Do not commit your `.env` file or real database credentials.**

---

### 5. Run database migrations

Apply the existing database migrations:

```bash
npm run migration:run
```

The migration configuration is defined in the project's TypeORM data source.

---

### 6. Seed the database

The repository includes CSV seed data for the development environment.

Run:

```bash
npm run seed
```

The seed process imports:

- Roles
- Categories
- Authors
- Books
- Users
- Copies
- Book/author relationships

The seed script reads these CSV files from the `data/` directory.

A successful seed should populate approximately:

| Table | Records |
|---|---:|
| Roles | 3 |
| Categories | 165 |
| Authors | 2,418 |
| Books | 2,109 |
| Users | 55 |
| Copies | 6,327 |
| Book/Author relationships | 3,150 |

These are the current seed verification figures documented in the development roadmap.

---

### 7. Start the API

For development with automatic reload:

```bash
npm run start:dev
```

The API runs on:

```text
http://localhost:3000
```

The application defaults to port `3000` when `PORT` is not provided.

---

## Test the API Locally

Once the server is running, you can test the API using your browser, `curl`, Postman, Insomnia, or another HTTP client.

### Swagger UI

The easiest way to explore the API is Swagger:

```text
http://localhost:3000/api
```

Open that URL in your browser.

Swagger is configured directly in the NestJS application and provides an interactive API interface.

From Swagger you can inspect the available endpoints and send requests directly to your local API.

---

### Example: Get books

```bash
curl http://localhost:3000/books
```

Or open:

```text
http://localhost:3000/books
```

in your browser.

---

### Example: Get a book

```bash
curl http://localhost:3000/books/<book-id>
```

Replace `<book-id>` with an ID from the database.

---

### Example: Get categories

```bash
curl http://localhost:3000/categories
```

---

### Example: Get authors

```bash
curl http://localhost:3000/authors
```

---

### Example: Get users

```bash
curl http://localhost:3000/users
```

---

### Example: Get copies for a book

```bash
curl http://localhost:3000/books/<book-id>/copies
```

---

## Quick Start

If PostgreSQL is already installed and running, the complete local setup is:

```bash
git clone https://github.com/ameerajamaludin/library-management-api.git

cd library-management-api

npm install

# Configure .env first

npm run migration:run

npm run seed

npm run start:dev
```

Then open:

```text
http://localhost:3000/api
```

to explore the API through Swagger.

---

## Database

The database uses PostgreSQL with TypeORM.

The database domain model includes:

```text
Category
   │
   └── Book
        │
        ├── Copy
        │
        └── BookAuthor ─── Author

Role
   │
   └── User
        │
        └── Borrow
             │
             ├── Copy
             ├── Return
             └── Fine
```

Database schema changes are managed through TypeORM migrations rather than automatic schema synchronization.

---

## Seed Dataset

The development dataset originates from the separate:

**Open Library Data Retrieval and Normalization**

project:

https://github.com/ameerajamaludin/openlibrary-data-retrieval-and-normalization

That project retrieves book metadata from Open Library and processes it through data-quality analysis, category taxonomy definition, normalization, accuracy verification, classification adjustment, and finalization.

For this API project, the dataset has been reduced to **2,109 book records** for use as a manageable development/test dataset.

The API seed data is organized into relational CSV files rather than importing the original dataset directly.

This allows the application to demonstrate relationships between:

- Books
- Authors
- Categories
- Copies
- Users
- Roles
- Book/author relationships

---

## License

This project is currently marked as `UNLICENSED` in `package.json`.


