import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class AddFineBorrowUnique20260930300000
  implements MigrationInterface
{
  name = 'AddFineBorrowUnique20260930300000';

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    // Keep the earliest fine for each borrow so the
    // constraint can be added even if duplicates were
    // ever written before it existed.
    await queryRunner.query(`
      DELETE FROM "fines"
      WHERE "fine_id" NOT IN (
        SELECT MIN("fine_id")
        FROM "fines"
        GROUP BY "borrow_id"
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "fines"
      ADD CONSTRAINT "UQ_fines_borrow_id"
      UNIQUE ("borrow_id")
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fines"
      DROP CONSTRAINT "UQ_fines_borrow_id"
    `);
  }
}