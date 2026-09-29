# Library Management API — Development Roadmap

## 1. Project Overview

**Project:** Library Management API

**Purpose:**  
Build a REST API for managing a library's books, physical copies, members, borrowing, returns, overdue tracking, and fines.

### Core technology stack

- TypeScript
- NestJS
- PostgreSQL
- TypeORM
- JWT Authentication
- Swagger / OpenAPI

---

# 2. Architecture

## High-Level Modules

```text
Library Management API
│
├── Books
│
├── Users
│
├── Auth
│
└── Borrows
    │
    ├── Returns
    │
    └── Overdue
        │
        └── Fines
```

## Main Database Relationships

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
                 │
                 ├── returns
                 │
                 └── fines
```

---

# 3. Roles and Permissions

## ADMIN

- Manage users
- Manage books
- View reports

## LIBRARIAN

- Manage books
- Manage members
- Issue books
- Process returns

## MEMBER

- View books
- View own borrows
- View own fines

---

# 4. Business Rules

These rules must be enforced by the application.

### Borrowing

When a member borrows a book:

```text
availableCopies -= 1
```

A member cannot borrow a book when there are no available copies.

### Returning

When a borrowed copy is returned:

```text
availableCopies += 1
```

### Ownership

Members can access:

- Their own borrow records
- Their own fines

Members must not be able to access another member's private borrowing information.

### Authorization

Administrative and librarian operations must be protected by role-based authorization.

---

# 5. Development Phases

---

## Phase 1 — Project & Database Foundation

### Status: ✅ Completed

### 1.1 Project setup

- [x] Create NestJS project
- [x] Configure TypeScript
- [x] Configure environment variables
- [x] Install PostgreSQL dependencies
- [x] Configure TypeORM
- [x] Configure database connection

### 1.2 Database entities

- [x] Create `Category` entity
- [x] Create `Book` entity
- [x] Create `Author` entity
- [x] Create `BookAuthor` entity
- [x] Create `Role` entity
- [x] Create `User` entity
- [x] Create `Copy` entity
- [x] Create `Borrow` entity
- [x] Create `Return` entity
- [x] Create `Fine` entity

### 1.3 Entity relationships

- [x] Category → Books
- [x] Book → Copies
- [x] Book → Authors
- [x] Author → Books
- [x] Role → Users
- [x] User → Borrows
- [x] Copy → Borrows
- [x] Borrow → Return
- [x] Borrow → Fines
- [x] Fines → User/Copy/Book

### 1.4 Modules

- [x] Books module
- [x] Authors module
- [x] Categories module
- [x] Roles module
- [x] Users module
- [x] Copies module
- [x] Borrows module
- [x] Returns module
- [x] Fines module

note: Phase 2 module
- [ ] Auth module

### 1.5 Database migrations

- [x] Configure migration system
- [x] Generate initial schema migration
- [x] Run initial migration
- [x] Verify PostgreSQL tables
- [x] Generate user ID type correction migration
- [x] Run user ID migration

### 1.6 CSV seed system

- [x] Create CSV seed infrastructure
- [x] Import roles
- [x] Import categories
- [x] Import authors
- [x] Import books
- [x] Import users
- [x] Import copies
- [x] Import book-author relationships
- [x] Verify database row counts

### Current seed verification

```text
roles          = 3
categories     = 165
authors        = 2,418
books          = 2,109
users          = 55
copies         = 6,327
book_authors   = 3,150
```

### 1.7 API foundation

- [x] Create Books service
- [x] Create Books controller
- [x] Create Authors service/controller
- [x] Create Categories service/controller
- [x] Create Users service/controller
- [x] Create Copies service/controller
- [x] Verify database queries through HTTP endpoints
- [x] Configure global validation
- [x] Configure API error handling
- [x] Configure Swagger/OpenAPI

### Phase 1 acceptance criteria

Phase 1 is complete when:

- PostgreSQL schema is working
- All foundational entities exist
- Relationships are working
- Seed data can be loaded
- API can successfully read seeded data
- Swagger documents the initial endpoints
- No database connection or entity initialization errors remain

---

# Phase 2 — Books & Catalog API

### Status: ✅ Completed

Build the public/library catalog functionality.

### Books

- [x] `GET /books`
- [x] `GET /books/:id`
- [x] `POST /books`
- [x] `PATCH /books/:id`
- [x] `DELETE /books/:id`
- [x] Delete protected by existing copies
- [x] Delete protected by author relationships
- [x] Non-ACTIVE books cannot be deleted

#### Book status endpoints

- [x] `GET /books/status/:status`
- [x] Filter by `ACTIVE`
- [x] Filter by `INACTIVE`
- [x] Filter by `ARCHIVED`
- [x] Swagger documentation

### Categories

- [x] `GET /categories`
- [x] `GET /categories/:id`

### Authors

- [x] `GET /authors`
- [x] `GET /authors/:id`
- [x] Search author by `author_id` and return the author's book details
- [x] Search book and return the book's author details

### Users

- [x] `GET /users`
- [x] `GET /users/:id`
- [x] Include role information in user response
- [x] Nonexistent user returns 404

### Copies

- [x] `GET /books/:id/copies`
- [x] `POST /books/:id/copies`
- [x] `PATCH /copies/:id`
- [x] Return total copy count for a book
- [x] Return available copy count for a book

future module
- [ ] Remove/deactivate copy functionality

### Catalog requirements

- [x] Pagination
- [x] Search by title
- [x] Search by ISBN
- [x] Filter by category
- [x] Filter by fiction/nonfiction
- [x] Author information on book details
- [x] Book information on author details
- [x] Availability information
- [x] Total copy count
- [x] Available copy count
- [x] Book lifecycle status

### Borrow / Return / Fine API

- [x] Create Borrow API
- [x] Return borrowed copy
- [x] Automatically update copy status on borrow/return
- [x] View borrow details with user, copy, and book
- [x] View user's borrowing history
- [x] View copy borrowing history
- [x] Create Return API
- [x] View return details with borrow information
- [x] Create Fine API
- [x] View fine details with user, copy, and book
- [x] Pay Fine API
- [x] Record fine payment timestamp
- [x] Expose `copy_id` in Fine API responses

### Phase 2 acceptance criteria

A user can browse the library catalog and retrieve book, author, category, and copy information through documented REST endpoints.

---

# Phase 3 — Authentication & Authorization

### Status: ⬜ Not Started

Implement JWT authentication and role-based access control.

### Authentication

- [ ] Login endpoint
- [ ] Password handling
- [ ] Password hashing
- [ ] JWT generation
- [ ] JWT validation
- [ ] Authentication guard
- [ ] Current-user decorator

### Authorization

- [ ] Role decorator
- [ ] Role guard
- [ ] ADMIN permissions
- [ ] LIBRARIAN permissions
- [ ] MEMBER permissions

### Access rules

#### ADMIN

- [ ] Manage users
- [ ] Manage books
- [ ] View reports

#### LIBRARIAN

- [ ] Manage books
- [ ] Manage members
- [ ] Issue books
- [ ] Process returns

#### MEMBER

- [ ] View books
- [ ] View own borrows
- [ ] View own fines

### Phase 3 acceptance criteria

Authentication and role-based authorization are enforced consistently across protected endpoints.

---

# Phase 4 — Borrowing

### Status: 🟢 In Progress

Implement the core library transaction.

### Borrow entity

Define:

- Borrow ID
- User/member
- Copy
- Borrow date
- Due date
- Status
- Return relationship

### Borrow workflow

```text
Member
   │
   ▼
Request book
   │
   ▼
Check available copy
   │
   ├── No copy → Reject
   │
   └── Available
          │
          ▼
      Create borrow
          │
          ▼
   Mark copy as borrowed
```

### Endpoints

- [x] Issue/borrow book
- [x] View borrow
- [x] View member borrows
- [x] View active borrows
- [x] View borrowing history

### Business rules

- [x] Cannot borrow when no copy is available
- [x] Select an available copy
- [x] Create borrow transaction
- [x] Change copy status
- [x] Maintain due date
- [x] Prevent invalid duplicate operations

### Transaction integrity

Borrowing and copy-status changes should be handled as one database transaction.

### Phase 4 acceptance criteria

A valid member can borrow an available copy and the database remains consistent.

---

# Phase 5 — Returns

### Status: 🟢 In Progress

Implement the return workflow.

### Return workflow

```text
Borrow
  │
  ▼
Process return
  │
  ├── Create return record
  │
  ├── Complete borrow
  │
  └── Make copy available
```

### Endpoints

- [x] Process return
- [x] View return record
- [x] View returned borrow history

### Business rules

- [x] Cannot return an already-returned borrow
- [x] Return must reference the correct borrow
- [x] Copy becomes available
- [x] Borrow becomes completed
- [x] Return date recorded

### Phase 5 acceptance criteria

A borrowed copy can be returned and all related records are updated consistently.

---

# Phase 6 — Overdue Tracking

### Status: ⬜ Not Started

Identify active borrows whose due date has passed.

### Requirements

- [ ] Determine overdue status
- [ ] Query overdue borrows
- [ ] View overdue members
- [ ] View overdue books
- [ ] Prevent incorrect overdue calculations

### Potential endpoints

- [ ] `GET /borrows/overdue`
- [ ] `GET /users/:id/overdue`

### Phase 6 acceptance criteria

The API can reliably identify currently overdue borrows.

---

# Phase 7 — Fines

### Status: 🟢 In Progress

Implement fines associated with overdue borrowing.

### Fine requirements

- [x] Create fine entity
- [x] Associate fine with borrow
- [ ] Calculate overdue amount
- [x] Track fine status
- [x] View member fines
- [x] View individual fine
- [x] Expose user information in fine responses
- [x] Expose copy information in fine responses
- [x] Expose book information in fine responses
- [x] Pay fine
- [x] Record payment timestamp
- [x] Expose `copy_id` in fine responses
- [ ] Prevent multiple fines for the same borrow when only one fine is allowed

### Member access

Members can:

```text
GET /me/fines
```

but must not access another member's fines.

### Phase 7 acceptance criteria

Overdue borrowing can generate and expose the appropriate fine information.

---

# Phase 8 — Reports

### Status: ⬜ Not Started

Implement administrative reporting.

### Potential reports

- [ ] Total books
- [ ] Total copies
- [ ] Available copies
- [ ] Borrowed copies
- [ ] Active members
- [ ] Active borrows
- [ ] Overdue borrows
- [ ] Outstanding fines
- [ ] Popular books
- [ ] Borrowing history

### Access

Reports should be restricted to authorized administrative users.

### Phase 8 acceptance criteria

Authorized users can retrieve useful library operational statistics.

---

# Phase 9 — Validation & Error Handling

### Status: ⬜ Not Started

Improve API reliability and developer experience.

### Validation

- [ ] DTO validation
- [ ] Required fields
- [ ] Email validation
- [ ] ID validation
- [ ] Enum validation
- [ ] Pagination validation
- [ ] Search/filter validation

### Error handling

- [ ] 400 Bad Request
- [ ] 401 Unauthorized
- [ ] 403 Forbidden
- [ ] 404 Not Found
- [ ] 409 Conflict
- [ ] 500 Internal Server Error

### Business errors

- [ ] Book unavailable
- [ ] Invalid borrow
- [ ] Invalid return
- [ ] Already returned
- [ ] Invalid user
- [ ] Invalid copy
- [ ] Unauthorized operation

---

# Phase 10 — Testing

### Status: ⬜ Not Started

## Unit tests

- [ ] Books service
- [ ] Users service
- [ ] Borrow service
- [ ] Return service
- [ ] Fine service
- [ ] Authentication
- [ ] Authorization

## Integration tests

- [ ] Database integration
- [ ] Borrow transaction
- [ ] Return transaction
- [ ] Fine calculation

## End-to-end tests

- [ ] Login
- [ ] Browse books
- [ ] Borrow book
- [ ] Return book
- [ ] Overdue flow
- [ ] Fine flow
- [ ] Role restrictions

### Critical test

```text
Available copy
      ↓
Borrow
      ↓
copy unavailable
      ↓
Return
      ↓
copy available
```

---

# Phase 11 — API Documentation

### Status: 🟢 In Progress

- [x] Configure Swagger
- [ ] Document authentication
- [x] Document DTOs
- [x] Document response schemas
- [ ] Document error responses
- [ ] Document role requirements
- [x] Add examples
- [x] Verify all endpoints appear correctly

---

# Phase 12 — Production Readiness

### Status: ⬜ Not Started

### Configuration

- [ ] Production environment variables
- [ ] Secure JWT configuration
- [ ] Database configuration
- [ ] CORS configuration
- [ ] Logging configuration

### Database

- [ ] Review indexes
- [ ] Review foreign keys
- [ ] Review constraints
- [ ] Migration strategy
- [ ] Backup strategy

### Security

- [ ] Password security
- [ ] JWT security
- [ ] Input validation
- [ ] Authorization checks
- [ ] Rate limiting
- [ ] Sensitive error handling

### Deployment

- [ ] Production build
- [ ] Docker configuration
- [ ] Database deployment
- [ ] API deployment
- [ ] Health check endpoint
- [ ] Environment configuration

---

# 6. Current Position

## Completed

```text
Phase 1
├── Project setup                 ✅
├── PostgreSQL                    ✅
├── TypeORM                       ✅
├── Entities                      ✅
├── Relationships                 ✅
├── Migrations                    ✅
├── CSV seed system               ✅
├── Initial data import           ✅
└── Database verification         ✅
```

## Current task

```text
Phase 1
   ↓
API foundation
   ↓
GET /books
GET /books/:id
GET /categories
GET /authors
...
```

## Immediate next milestone

Build the first read-only API endpoints and verify that NestJS can retrieve the seeded PostgreSQL data.

---

# 7. Development Principles

## Work incrementally

Each feature should follow:

```text
Entity
  ↓
Migration
  ↓
DTO
  ↓
Service
  ↓
Controller
  ↓
Validation
  ↓
Authorization
  ↓
Test
  ↓
Swagger documentation
```

## Database changes

Do not manually modify production schema.

Use:

```text
Entity change
    ↓
Generate migration
    ↓
Review migration
    ↓
Run migration
```

## Business logic

Business rules should live primarily in services rather than controllers.

Controllers should handle:

```text
HTTP request
      ↓
DTO validation
      ↓
Service
      ↓
HTTP response
```

## Transactions

Operations that modify multiple related records should use database transactions where consistency is required.

Example:

```text
Borrow book
    ↓
Create borrow
    +
Change copy status
```

Both operations should succeed or fail together.

---

# 8. Definition of Done

A feature is considered complete when:

- [ ] Entity/database requirements are implemented
- [ ] Migration exists where needed
- [ ] DTOs are defined
- [ ] Service logic is implemented
- [ ] Controller endpoint is implemented
- [ ] Validation is implemented
- [ ] Authorization is implemented where required
- [ ] Business rules are enforced
- [ ] Error cases are handled
- [ ] Tests exist for important behavior
- [ ] Swagger documentation is updated
- [ ] The application compiles successfully

---

# 9. Progress Log

## 2026-09-29

### Database foundation completed

Successfully imported:

```text
Roles:             3
Categories:      165
Authors:       2,418
Books:         2,109
Users:            55
Copies:        6,327
Book Authors:  3,150
```

### Important schema correction

The original `users.user_id` type was changed from integer to varchar because the source dataset uses IDs such as:

```text
L001
L002
L003
```

Migration generated and applied successfully.

### Current state

Database foundation is working and verified.

### Next task

Begin API foundation with read-only catalog endpoints.