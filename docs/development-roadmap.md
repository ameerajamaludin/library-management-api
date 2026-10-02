# Library Management API — Development Roadmap

## 1. Project Overview

**Purpose:** A RESTful API built to manage physical library operations including books, members, borrowing workflows, overdue tracking, and fines.

### Tech Stack
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL + TypeORM
- **Roles & Permission:** Role-Based Access Control (RBAC)
- **Docs:** Swagger

### Project Structure

```text
library-management-api
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

## 2. Architecture & Domain Model

### Module Architecture
flowchart TD
    API["Library Management API"]

    API --> Books["Books"]
    API --> Users["Users"]
    API --> Auth["Auth"]

    Books --> Borrows["Borrows"]
    Users --> Borrows
    Auth --> Borrows

    Borrows --> Returns["Returns"]
    Borrows --> Overdue["Overdue"]

    Overdue --> Fines["Fines"]

### Permission Matrix
| Operation | ADMIN | LIBRARIAN | MEMBER |
|---|:---:|:---:|:---:|
| View all users | ✓ | — | — |
| Query user by ID or name| ✓ | — | — |
| Add users | ✓ | — | — |
| Update users | ✓ | — | — |
| Remove users | ✓ | — | — |
| View all books | ✓ | ✓ | ✓ |
| Query book by ID or name | ✓ | ✓ | ✓ |
| Add new book | ✓ | ✓ | — |
| Update books metadata | ✓ | ✓ | — |
| Delete books while it has existing copies | — | — | — |
| Delete books while its copy is actively borrowed | — | — | — |
| Delete books with no existing copies OR not actively borrowed | ✓ | ✓ | — |
| View all authors | ✓ | ✓ | ✓ |
| Query author by ID or name | ✓ | ✓ | ✓ |
| Update authors metadata | ✓ | ✓ | — |
| Remove authors | — | — | — |
| View all categories | ✓ | ✓ | ✓ |
| Query category by ID or name | ✓ | ✓ | ✓ |
| Update categories | — | — | — |
| Remove categories | — | — | — |
| View all copies | ✓ | ✓ | ✓ |
| Query copy by copy id, book id, book name | ✓ | ✓ | ✓ |
| Add copies to existing book | ✓ | ✓ | —  |
| Update copies of an existing book | ✓ | ✓ | — |
| Delete copies of an existing book | ✓ | ✓ | — |
| Delete copies of an existing book it is actively borrowed | — | — | — |
| View all borrowed books | ✓ | ✓ | — |
| View own borrowed books | ✓ | ✓ | ✓ |
| Query borrowed books by borrow id | ✓ | ✓ | — |
| Borrow books for themselves | ✓ | ✓ | ✓ |
| Borrow books on behalf of all users | ✓ | ✓ | — |
| View return records | ✓ | ✓ | — |
| View returned borrow history | ✓ | ✓ | — |
| Query returned books by return id | ✓ | ✓ | — |
| Return books for themselves | ✓ | ✓ | ✓ |
| Return books on behalf of all users | ✓ | ✓ | — |
| View all overdue books | ✓ | ✓ | — |
| View own overdue books  | ✓ | ✓ | ✓ |
| Query overdue books by fine id | ✓ | ✓ | — |
| View all users that have overdue books  | ✓ | ✓ | — |
| View all users that have active borrows  | ✓ | ✓ | — |
| View all users that have active fines  | ✓ | ✓ | — |
| Add a fine | —  | —  | — |
| Update a fine | ✓  | ✓  | — |
| Pay fine for themselves| ✓  | ✓  | ✓ |
| Pay fine on behalf of others | ✓  | ✓  | — |
| Delete existing fines | —  | —  | — |
| View reports | ✓ | ✓ | — |

### Core Business Rules

These rules define the expected behavior of the library system.
Development phases implement and verify these rules; they should not redefine them.

#### Catalog & Copies

- A Book represents the bibliographic record.
- A Copy represents a physical copy of a Book.
- A Book may have multiple Copies.
- A Copy belongs to exactly one Book.
- A Book cannot be deleted while it has existing Copies.
- A Copy cannot be deleted while it is actively borrowed.
- Book metadata changes must not break existing Copy → Book relationships.
- A Book's availability is determined from its Copies.

#### Borrowing

- A Borrow creates a borrowing record for a specific User and physical Copy.
- A Copy can have at most one active Borrow at a time.
- A User cannot borrow a Copy that is unavailable.
- Borrowing an available Copy makes that Copy unavailable.
- A Borrow has a due date.
- Borrowing on behalf of another User is restricted by the Permission Matrix.

#### Returning

- A Return belongs to an existing Borrow.
- A Borrow can only be returned once.
- Returning a Copy makes that Copy available again.
- A completed Borrow cannot be returned again.
- Returning on behalf of another User is restricted by the Permission Matrix.

#### Overdue & Fine Calculation

- A Borrow becomes overdue when it remains active 1 calendar day after its due date.
- Overdue days are calculated as the number of calendar days elapsed after the Borrow's due date.
- A Fine is automatically created when a Borrow becomes overdue.
- The fine rate is RM2 per overdue day.
- The Fine amount is calculated as `overdue_days × RM2`.
- Fine accumulation continues while the Borrow remains overdue.
- Fine accumulation stops when the Borrow is returned.
- No grace period applies.
- No maximum fine amount applies.

#### Users & Authorization

- Every authenticated request is associated with a User.
- The User's role is determined from the database.
- The database role, not request input, determines permissions.
- ADMIN, LIBRARIAN, and MEMBER permissions are defined by the Permission Matrix.
- Users may access their own private borrowing/fine information according to the Permission Matrix.
- Users must not access another user's private information unless explicitly permitted.

---

## 3. Development Phases

### Phase 1: Project & Database Foundation
> STATUS: ✅ COMPLETED | Goal: Establish a runnable API foundation with the database schema, domain entities, relationships, seed data, core modules, validation, error handling, and API documentation required for subsequent development phases.

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
- [x] Fine → User/Copy/Book

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
- [x] Auth module

#### 1.5 Database migrations

- [x] Configure migrations
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

> Acceptance Criteria: Phase 1 is complete when the application can start successfully against PostgreSQL, initialize its schema through migrations, populate the expected seed data, expose the foundational API modules, validate incoming requests, handle API errors consistently, and provide Swagger/OpenAPI documentation without initialization, connection, or schema errors.

### Phase 2: Catalog Management API
> STATUS: ✅ COMPLETED | Goal: To build the library catalog functionality for browsing and managing books, authors, categories, and physical copies.

#### 2.1 Books

- [x] `GET /books` — ADMIN, LIBRARIAN, MEMBER
- [x] `GET /books/:id` — ADMIN
- [x] `POST /books` — ADMIN, LIBRARIAN
- [x] `PATCH /books/:id` — ADMIN, LIBRARIAN
- [x] `DELETE /books/:id` — ADMIN, LIBRARIAN
- [x] Delete protected by existing copies
- [x] Delete protected by author relationships
- [x] Non-ACTIVE books cannot be deleted
- [x] When book metadata is updated, all copies associated with that book must reflect the updated book metadata
- [x] Copy records must continue to reference the same book after book metadata updates
- [x] Changing `openlibrary_work_id` must preserve all existing copy relationships
- [x] Query book by name — ADMIN, LIBRARIAN

#### 2.2 Book status endpoints

- [x] `GET /books/status/:status` — ADMIN, LIBRARIAN, MEMBER
- [x] Filter by `ACTIVE`
- [x] Filter by `INACTIVE`
- [x] Filter by `ARCHIVED`
- [x] Swagger documentation

#### 2.3 Categories

- [x] `GET /categories` — ADMIN, LIBRARIAN, MEMBER
- [x] `GET /categories/:id` — ADMIN

#### 2.4 Authors

- [x] `GET /authors` — ADMIN, LIBRARIAN, MEMBER
- [x] `GET /authors/:id` — ADMIN
- [x] `PATCH /authors/:id` — ADMIN, LIBRARIAN
- [x] Search author by `author_id` and return the author's book details
- [x] Search book and return the book's author details

#### 2.5 Copies

- [x] `GET /books/:id/copies` — ADMIN, LIBRARIAN, MEMBER
- [x] `GET /copies/:id` — ADMIN, LIBRARIAN, MEMBER
- [x] `POST /books/:id/copies` — ADMIN, LIBRARIAN
- [x] `PATCH /copies/:id` — ADMIN, LIBRARIAN
- [x] `DELETE /copies/:id` — ADMIN, LIBRARIAN
- [x] Return total copy count for a book
- [x] Return available copy count for a book
- [x] Query copies by book name — ADMIN, LIBRARIAN, MEMBER

#### 2.6 Catalog requirements

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

> Acceptance Criteria: Phase 2 is complete when the library catalog supports the documented book, author, category, and copy operations according to the Permission Matrix, including catalog search, filtering, pagination, lifecycle status, author relationships, copy relationships, and availability information.

### Phase 3: Authorization & Role-Based Access Control

> STATUS: ⏳ IN PROGRESS |  Goal: Implement and verify the authorization model defined by the Permission Matrix.

#### 3.1 Authorization mechanism

- [x] Read `User-Id` from request headers
- [x] Find user by `user_id`
- [x] Retrieve user's role from the database
- [x] Reject requests when `User-Id` is missing
- [x] Reject requests when `User-Id` does not exist
- [x] Return `403 Forbidden` when the user's role is not permitted
- [x] Ensure the role used for authorization comes from the database user record

#### 3.2 Permission enforcement

- [x] Implement role/permission checking
- [x] Apply authorization rules to protected endpoints
- [x] Verify all protected endpoints against the Permission Matrix
- [x] Correct endpoint permissions that do not match the Permission Matrix
- [x] Verify member access is restricted to their own private borrowing, overdue, and fine information where required by the Permission Matrix
- [x] Verify operations performed on behalf of other users are restricted according to the Permission Matrix

#### 3.3 Authorization testing

- [x] Test ADMIN permissions
- [x] Test LIBRARIAN permissions
- [x] Test MEMBER permissions
- [x] Test missing `User-Id`
- [x] Test invalid `User-Id`
- [x] Test insufficient permissions
- [x] Test own-user versus other-user access where required by the Permission Matrix
- [x] Verify `User-Id` cannot specify or override the database role

> Acceptance Criteria: Phase 3 is complete when authenticated API requests are authorized according to the Permission Matrix, including role-based permissions and own-user versus other-user access restrictions, and requests using missing or invalid user identities or insufficient permissions are rejected consistently.

### Phase 4: Borrowing

> STATUS: ✅ COMPLETED  | Goal: Implement the borrowing workflow defined in the Core Business Rules and enforce the borrowing permissions defined by the Permission Matrix.

#### 4.1 Borrow workflow

- [x] Issue/borrow a book
- [x] Select an available copy
- [x] Create borrow record
- [x] Set borrow due date
- [x] Mark borrowed copy as unavailable
- [x] Prevent borrowing an unavailable copy
- [x] Prevent duplicate active borrowing of the same copy
- [x] Wrap borrow and copy-state changes in a database transaction

#### 4.2 Borrow permissions

- [x] Allow ADMIN, LIBRARIAN, and MEMBER to borrow books for themselves
- [x] Prevent MEMBER from borrowing books on behalf of another user
- [x] Allow ADMIN and LIBRARIAN to borrow books on behalf of another user
- [x] Verify borrowing permissions against the Permission Matrix

#### 4.3 Borrow endpoints

- [x] `POST /borrows` — ADMIN, LIBRARIAN, MEMBER
- [x] View all borrowed books — ADMIN, LIBRARIAN
- [x] View own borrowed books — ADMIN, LIBRARIAN, MEMBER
- [x] Query borrowed book by borrow ID — ADMIN, LIBRARIAN
- [x] View copy borrowing history

> Acceptance Criteria: Phase 4 is complete when an authorized user can borrow an available copy according to the Permission Matrix, the borrow and copy states remain consistent, and the resulting borrow record contains the required user, copy, and due-date information.

### Phase 5: Returns

> STATUS: ✅ COMPLETED  | Goal: Implement the return workflow defined in the Core Business Rules and enforce the return permissions defined by the Permission Matrix.

#### 5.1 Return workflow

- [x] Process return
- [x] Create return record
- [x] Complete borrow
- [x] Make copy available
- [x] Record return date
- [x] Prevent returning an already-returned borrow

#### 5.2 Return permissions

- [x] Allow ADMIN, LIBRARIAN, and MEMBER to return books for themselves
- [x] Prevent MEMBER from returning books on behalf of another user
- [x] Allow ADMIN and LIBRARIAN to return books on behalf of another user
- [x] Verify return permissions against the Permission Matrix

#### 5.3 Return endpoints

- [x] Process return — ADMIN, LIBRARIAN, MEMBER
- [x] View return records — ADMIN, LIBRARIAN
- [x] View returned borrow history — ADMIN, LIBRARIAN
- [x] Query returned books by return ID — ADMIN, LIBRARIAN

> Acceptance Criteria: Phase 5 is complete when an authorized user can return a borrowed copy according to the Permission Matrix, the Borrow, Return, and Copy records remain consistent, and the return date is recorded without allowing an already-returned borrow to be returned again.

### Phase 6: Overdue Tracking & Fines

> STATUS: ✅ COMPLETED | Goal: Identify overdue borrows and implement the fine workflow defined by the Core Business Rules and Permission Matrix.

#### 6.1 Overdue tracking

- [x] Determine overdue status
- [x] Calculate overdue days based on calendar days after the due date
- [x] Query overdue borrows
- [x] View all users that have overdue books
- [x] View overdue books
- [x] Verify overdue-day calculation

#### 6.2 Overdue permissions

- [x] Allow ADMIN, LIBRARIAN, to view overdue books
- [x] Allow ADMIN, LIBRARIAN, and MEMBER to view their own overdue books
- [x] Restrict viewing all users with overdue books to ADMIN and LIBRARIAN
- [x] Restrict querying overdue books by fine ID to ADMIN and LIBRARIAN
- [x] Verify overdue permissions against the Permission Matrix

#### 6.3 Overdue endpoints

- [x] `GET /borrows/overdue`
- [x] `GET /users/:id/overdue`

#### 6.4 Fine management

- [x] Create Fine entity
- [x] Associate Fine with Borrow
- [x] Automatically create a Fine when a Borrow becomes overdue
- [x] Calculate fine amount at RM2 per overdue calendar day
- [x] Stop fine accumulation when the Borrow is returned
- [x] Track fine status
- [x] View member fines
- [x] View individual fine
- [x] Expose user information in fine responses
- [x] Expose copy information in fine responses
- [x] Expose book information in fine responses
- [x] Prevent duplicate Fine creation for the same Borrow
- [x] Pay Fine
- [x] Record payment timestamp
- [x] Expose `copy_id` in Fine responses

#### 6.5 Fine permissions

- [x] Allow ADMIN, LIBRARIAN, and MEMBER to pay their own Fine
- [x] Allow ADMIN, LIBRARIAN to pay a Fine on behalf of another user
- [x] Allow ADMIN and LIBRARIAN to update a Fine
- [x] Verify Fine permissions against the Permission Matrix

#### 6.6 Fine access

- [x] Implement own-fine access
- [x] Verify MEMBER cannot access another member's fines

> Acceptance Criteria: Phase 6 is complete when the API reliably identifies overdue borrows, automatically creates and calculates fines at RM2 per overdue calendar day until return, and enforces the overdue and Fine permissions defined by the Permission Matrix.

### Phase 7: Manual Pre Test

> STATUS: ⬜ PLANNED  |  Goal: To manually verify that the implemented API endpoints behave according to the Core Business Rules and Permission Matrix before reports are generated.

#### 7.1 Users

- [ ] Execute all User scenarios from `test-case-all-modules.txt`
- [ ] Verify expected responses and authorization behavior

#### 7.2 Books

- [ ] Execute all Book scenarios from `test-case-all-modules.txt`
- [ ] Verify expected responses and authorization behavior

#### 7.3 Authors

- [ ] Execute all Author scenarios from `test-case-all-modules.txt`
- [ ] Verify expected responses and authorization behavior

#### 7.4 Categories

- [ ] Execute all Category scenarios from `test-case-all-modules.txt`
- [ ] Verify expected responses and authorization behavior

#### 7.5 Copies

- [ ] Execute all Copy scenarios from `test-case-all-modules.txt`
- [ ] Verify expected responses and authorization behavior

#### 7.6 Borrows

- [ ] Execute all Borrow scenarios from `test-case-all-modules.txt`
- [ ] Verify expected responses and authorization behavior

#### 7.7 Returns

- [ ] Execute all Return scenarios from `test-case-all-modules.txt`
- [ ] Verify expected responses and authorization behavior

#### 7.8 Overdue & Fines

- [ ] Execute all Overdue & Fine scenarios from `test-case-all-modules.txt`
- [ ] Verify expected responses and authorization behavior

#### 7.9 Permission Matrix verification

- [ ] Verify all applicable scenarios against the Permission Matrix
- [ ] Verify positive and negative role-based access scenarios
- [ ] Verify own-user versus other-user access where required by the Permission Matrix

#### 7.10 Core Business Rules verification

- [ ] Verify all applicable scenarios against the Core Business Rules
- [ ] Verify business-rule rejection scenarios
- [ ] Record any discrepancy between the implemented behavior and the expected business rules

> Acceptance Criteria: Phase 7 is complete when all scenarios in `test-case-all-modules.txt` have been manually executed, the observed API behavior is verified against the Permission Matrix and Core Business Rules, and all identified discrepancies have been resolved or explicitly recorded before Phase 8 begins.

### Phase 8: Reports

> STATUS: ⬜ PLANNED | Goal: To implement administrative reporting according to the Permission Matrix.

#### 8.1 Catalog reports

- [ ] Total books
- [ ] Total copies
- [ ] Available copies

#### 8.2 Borrowing reports

- [ ] Borrowed copies
- [ ] Active borrows
- [ ] Borrowing history

#### 8.3 Member reports

- [ ] Active members

#### 8.4 Overdue & Fine reports

- [ ] Overdue borrows
- [ ] Outstanding fines

#### 8.5 Popularity reports

- [ ] Popular books

#### 8.6 Report access

- [ ] Allow ADMIN to view reports
- [ ] Allow LIBRARIAN to view reports
- [ ] Prevent MEMBER from viewing reports
- [ ] Verify report access against the Permission Matrix

> Acceptance Criteria: Phase 8 is complete when ADMIN and LIBRARIAN users can retrieve the defined library operational reports and MEMBER users are denied access according to the Permission Matrix.

### Phase 9: Validation & Error Handling

> STATUS: ⬜ PLANNED | Goal: To ensure API requests and errors are handled consistently across the implemented library operations.

#### 9.1 Request validation

- [x] Validate DTO input
- [x] Validate required fields
- [x] Validate email fields
- [x] Validate IDs
- [x] Validate enum values
- [x] Validate pagination parameters
- [x] Validate search and filter parameters

#### 9.2 HTTP error handling

- [x] Handle `400 Bad Request`
- [x] Handle `401 Unauthorized`
- [x] Handle `403 Forbidden`
- [x] Handle `404 Not Found`
- [x] Handle `409 Conflict`
- [x] Handle `500 Internal Server Error`

#### 9.3 Library business errors

- [x] Handle unavailable book/copy
- [x] Handle invalid borrow
- [x] Handle invalid return
- [x] Handle already-returned borrow
- [x] Handle invalid user
- [x] Handle invalid copy
- [x] Handle unauthorized operation according to the Permission Matrix

> Acceptance Criteria: Phase 9 is complete when invalid requests, standard HTTP errors, and library-specific business errors are handled consistently with clear and appropriate API responses across the implemented endpoints.

### Phase 10: Testing

> STATUS: ⬜ PLANNED | Goal: To verify the implemented library workflows through unit, integration, and end-to-end tests.

#### 10.1 Unit tests

- [ ] Test Books service
- [ ] Test Users service
- [ ] Test Borrow service
- [ ] Test Return service
- [ ] Test Fine service
- [ ] Test Authorization

#### 10.2 Integration tests

- [ ] Test database integration
- [ ] Test Borrow transaction
- [ ] Test Return transaction
- [ ] Test Fine calculation

#### 10.3 End-to-end tests

- [ ] Test browsing books
- [ ] Test borrowing a book
- [ ] Test returning a book
- [ ] Test overdue flow
- [ ] Test fine flow
- [ ] Test role restrictions according to the Permission Matrix

#### 10.4 Critical workflow test

```text
Available copy
      ↓
Borrow
      ↓
Copy unavailable
      ↓
Return
      ↓
Copy available
```

- [ ] Verify the complete borrow → return copy-state transition

> Acceptance Criteria: Phase 10 is complete when unit, integration, and end-to-end tests pass for the core library workflows, including authorization according to the Permission Matrix, borrowing, returning, overdue handling, and fine calculation.

### Phase 11: API Documentation

> STATUS: ⏳ IN PROGRESS | Goal: To complete and maintain API documentation.

#### 11.1 Swagger configuration

- [x] Configure Swagger
- [x] Verify all endpoints appear correctly

#### 11.2 Request documentation

- [x] Document DTOs

#### 11.3 Response documentation

- [x] Document response schemas
- [x] Document error responses

#### 11.4 Authorization documentation

- [x] Document role requirements according to the Permission Matrix

#### 11.5 API examples

- [x] Add examples

> Acceptance Criteria: Phase 11 is complete when all API endpoints are correctly documented in Swagger, including DTOs, response schemas, error responses, role requirements according to the Permission Matrix, and relevant examples.

### FUTURE SCOPE: Phase 12 — Production Readiness