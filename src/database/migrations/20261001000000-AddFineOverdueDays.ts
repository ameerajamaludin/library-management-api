import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class AddFineOverdueDays20261001000000
  implements MigrationInterface
{
  name = 'AddFineOverdueDays20261001000000';

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fines"
      ADD COLUMN "overdue_days" integer NOT NULL DEFAULT 0
    `);

    // Backfill existing fines using the same rule the
    // application applies: completed 24-hour periods
    // after the due date, frozen at the return date
    // for borrows that were already returned.
    await queryRunner.query(`
      UPDATE "fines" f
      SET "overdue_days" = GREATEST(
        0,
        FLOOR(
          EXTRACT(
            EPOCH FROM (
              COALESCE(b."returned_at", NOW()) - b."due_at"
            )
          ) / 86400
        )::integer
      )
      FROM "borrows" b
      WHERE b."borrow_id" = f."borrow_id"
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fines"
      DROP COLUMN "overdue_days"
    `);
  }
}