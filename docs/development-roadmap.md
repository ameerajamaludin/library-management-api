# Library Management API — Development Roadmap

## 1. Project Overview

**Purpose:** A RESTful API built to manage physical library operations including books, members, borrowing workflows, overdue tracking, and fines.

### Tech Stack
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL + TypeORM
- **Roles & Permission:** Role-Based Access Control (RBAC)
- **Docs:** Swagger / OpenAPI

---

## 2. Architecture & Domain Model

### Module Architecture
`Auth` ➔ `Users` / `Roles` ➔ `Books` (Categories, Authors, Copies) ➔ `Borrows` (Returns, Overdue, Fines)

### Key Roles & Permissions
#### ADMIN

- Manage users
- Manage books
- View reports

#### LIBRARIAN

- Manage books
- Manage members
- Issue books
- Process returns

#### MEMBER

- View books
- View own borrows
- View own fines

### Core Business Rules
These rules must be enforced by the application.

#### Borrowing

When a member borrows a book:

```text
availableCopies -= 1
```

A member cannot borrow a book when there are no available copies.

#### Returning

When a borrowed copy is returned:

```text
availableCopies += 1
```

#### Ownership

Members can access:

- Their own borrow records
- Their own fines

Members must not be able to access another member's private borrowing information.

#### Authorization

Administrative and librarian operations must be protected by role-based authorization.

---

## 3. Development Phases

### Phase 1: Project & Database Foundation
> STATUS: ✅ COMPLETED | Goal: To set up the API foundation

#### 1.1 Project setup

- [x] Create NestJS project
- [x] Configure TypeScript
- [x] Configure environment variables
- [x] Install PostgreSQL dependencies
- [x] Configure TypeORM
- [x] Configure database connection

#### 1.2 Database entities

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

#### 1.3 Entity relationships

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

#### 1.4 Modules

- [x] Books module
- [x] Authors module
- [x] Categories module
- [x] Roles module
- [x] Users module
- [x] Copies module
- [x] Borrows module
- [x] Returns module
- [x] Fines module

#### 1.5 Database migrations

- [x] Configure migration
- [x] Generate initial schema migration
- [x] Run initial migration
- [x] Verify PostgreSQL tables
- [x] Generate user ID type correction migration
- [x] Run user ID migration

#### 1.6 CSV seed

- [x] Create CSV seed infrastructure
- [x] Import roles
- [x] Import categories
- [x] Import authors
- [x] Import books
- [x] Import users
- [x] Import copies
- [x] Import book-author relationships
- [x] Verify database row counts

#### Current seed verification

```text
roles          = 3
categories     = 165
authors        = 2,418
books          = 2,109
users          = 55
copies         = 6,327
book_authors   = 3,150
```

#### 1.7 API foundation

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

> Acceptance Criteria: Phase 1 is considered completed when the database, entities, relationships, seed data, API, and Swagger endpoints are working without initialization or connection errors.

### Phase 2: Catalog Management API
> STATUS: ✅ COMPLETED | Goal: To build the public/library catalog functionality

#### Books

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

#### Categories

- [x] `GET /categories`
- [x] `GET /categories/:id`

#### Authors

- [x] `GET /authors`
- [x] `GET /authors/:id`
- [x] Search author by `author_id` and return the author's book details
- [x] Search book and return the book's author details

#### Users

- [x] `GET /users`
- [x] `GET /users/:id`
- [x] Include role information in user response
- [x] Nonexistent user returns 404

#### Copies

- [x] `GET /books/:id/copies`
- [x] `POST /books/:id/copies`
- [x] `PATCH /copies/:id`
- [x] Return total copy count for a book
- [x] Return available copy count for a book

#### Catalog requirements

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

#### Borrow / Return / Fine API

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

> Acceptance Criteria: Phase 2 is considered completed when a user can browse the library catalog and retrieve book, author, category, and copy information through documented REST endpoints.

### Phase 3: Authorization & Role-Based Access Control
> STATUS: ⬜ PLANNED |  Goal: To implement role-based authorization and access control.

#### Authorization

- [ ] Role decorator
- [ ] Role guard
- [ ] ADMIN permissions
- [ ] LIBRARIAN permissions
- [ ] MEMBER permissions

#### Role-Based Access Control (RBAC)

##### ADMIN

- [ ] Manage users
- [ ] Manage books
- [ ] View reports

##### LIBRARIAN

- [ ] Manage books
- [ ] Manage members
- [ ] Issue books
- [ ] Process returns

##### MEMBER

- [ ] View books
- [ ] View own borrows
- [ ] View own fines

> Acceptance Criteria: Phase 3 is considered completed when role-based authorization is enforced consistently across protected endpoints.

### Phase 4: Borrowing
> STATUS: ⏳ IN PROGRESS | Goal: To implement the core library transaction

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

> Acceptance Criteria: Phase 4 is considered completed when a valid member can borrow an available copy and the database remains consistent.

### Phase 5: Returns

> STATUS: ⏳ IN PROGRESS | Goal: To implement the return workflow

#### Return workflow

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

#### Endpoints

- [x] Process return
- [x] View return record
- [x] View returned borrow history

#### Business rules

- [x] Cannot return an already-returned borrow
- [x] Return must reference the correct borrow
- [x] Copy becomes available
- [x] Borrow becomes completed
- [x] Return date recorded

> Acceptance Criteria: Phase 5 is considered completed when a borrowed copy can be returned and all related records are updated consistently.

### Phase 6: Overdue Tracking

> Status: ⬜ PLANNED | Goal: To identify active borrows whose due date has passed

#### Requirements

- [ ] Determine overdue status
- [ ] Query overdue borrows
- [ ] View overdue members
- [ ] View overdue books
- [ ] Prevent incorrect overdue calculations

#### Endpoints

- [ ] `GET /borrows/overdue`
- [ ] `GET /users/:id/overdue`

> Acceptance Criteria: Phase 6 is considered completed when the API can reliably identify currently overdue borrows.

### Phase 7: Fines
> STATUS: ⏳ IN PROGRESS | Goal: To implement fines associated with overdue borrowing

#### Requirements

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

#### Member access

Members can:

```text
GET /me/fines
```

but must not access another member's fines.

> Acceptance Criteria: Phase 7 is considered completed when overdue borrowing can generate and expose the appropriate fine information.

### Phase 8: Reports
> STATUS: ⬜ PLANNED | Goal: To implement administrative reporting

#### List of Reports

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

#### Access

Reports should be restricted to authorized administrative users.

> Acceptance Criteria: Phase 8 is considered completed when authorized users can retrieve useful library operational statistics.

### Phase 9: Validation & Error Handling
> STATUS: ⬜ PLANNED | Goal: To improve API reliability and developer experience

#### Validation

- [ ] DTO validation
- [ ] Required fields
- [ ] Email validation
- [ ] ID validation
- [ ] Enum validation
- [ ] Pagination validation
- [ ] Search/filter validation

#### Error handling

- [ ] 400 Bad Request
- [ ] 401 Unauthorized
- [ ] 403 Forbidden
- [ ] 404 Not Found
- [ ] 409 Conflict
- [ ] 500 Internal Server Error

#### Business errors

- [ ] Book unavailable
- [ ] Invalid borrow
- [ ] Invalid return
- [ ] Already returned
- [ ] Invalid user
- [ ] Invalid copy
- [ ] Unauthorized operation

> Acceptance Criteria: Phase 9 is considered completed when all request validation, standard HTTP errors, and library-specific business errors are handled consistently with clear, appropriate API responses.

### Phase 10: Testing
> Status: ⬜ PLANNED | Goal: To conduct unit, integration, and end-to-end tests

#### Unit tests

- [ ] Books service
- [ ] Users service
- [ ] Borrow service
- [ ] Return service
- [ ] Fine service
- [ ] Authorization

#### Integration tests

- [ ] Database integration
- [ ] Borrow transaction
- [ ] Return transaction
- [ ] Fine calculation

#### End-to-end tests

- [ ] Browse books
- [ ] Borrow book
- [ ] Return book
- [ ] Overdue flow
- [ ] Fine flow
- [ ] Role restrictions

#### Critical test

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
> Acceptance Criteria: Phase 10 is considered completed when unit, integration, and end-to-end tests cover the core library workflows and pass successfully, including authorization, borrowing, returning, overdue handling, and fine calculation.

### Phase 11: API Documentation

STATUS: ⏳ IN PROGRESS | Goal: To complete and maintain API documentation.

- [x] Configure Swagger
- [x] Document DTOs
- [x] Document response schemas
- [ ] Document error responses
- [ ] Document role requirements
- [x] Add examples
- [x] Verify all endpoints appear correctly

> Acceptance Criteria: Phase 11 is considered completed when all API endpoints are correctly documented in Swagger, including DTOs, response schemas, error responses, role requirements, and relevant examples.

### FUTURE SCOPE:  Phase 12 — Production Readiness
