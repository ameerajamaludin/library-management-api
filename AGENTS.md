# Library Management API — Agent Instructions

## Project

NestJS + TypeScript REST API for physical library operations.

- Database: PostgreSQL + TypeORM
- Authorization: RBAC
- API docs: Swagger

## Source of Truth

Before making changes, read:

- `docs/development-roadmap.md`
- `test/test-case-all-modules.txt`

**The Permission Matrix is the intended final API contract.**

Core Business Rules define expected library behavior.

## Development Rules

- Follow the current development phase in `docs/development-roadmap.md`.
- **Implement one bite-size roadmap task at a time.**
- Do not combine unrelated roadmap tasks into one task.
- Keep changes narrowly scoped to the current task.
- Do not implement future-phase work.
- Do not add new features, endpoints, permissions, or test scenarios unless required by the roadmap or Permission Matrix.
- Do not refactor unrelated code.
- Reuse existing project patterns and dependencies.
- If the code, roadmap, Permission Matrix, or Core Business Rules conflict, **stop and report the discrepancy before changing behavior**.
- Do not mark roadmap tasks complete until the task is implemented and verified.

## Permission & API

- Follow the Permission Matrix exactly for ADMIN, LIBRARIAN, and MEMBER.
- Do not infer permissions from existing code when it conflicts with the Matrix.
- Preserve existing API conventions.
- Keep Swagger consistent with the implemented API and Permission Matrix.

## Testing

- Run only the tests relevant to the current roadmap task.
- Fix test failures caused by the current change.
- Do not weaken, skip, remove, or rewrite tests merely to make them pass.
- Do not investigate or fix unrelated pre-existing test failures unless they block the current task.
- Do not expand testing scope beyond the current task unless the change directly affects another module or workflow.
- After the current task is verified, stop and report the result.

## Safety

- Never commit secrets or `.env` files.
- Do not modify migrations or seed data unless required by the current task.
- Do not add dependencies unless necessary and not already supported by the project.