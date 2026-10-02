import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class AddFinePaidBy20261001000100
  implements MigrationInterface
{
  name = 'AddFinePaidBy20261001000100';

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    // No backfill: the payer of a fine that was
    // already paid was never recorded, so the column
    // stays NULL for those rows. Payment of any fine
    // from now on fills it in.
    await queryRunner.query(`
      ALTER TABLE "fines"
      ADD COLUMN "paid_by" character varying(50)
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fines"
      DROP COLUMN "paid_by"
    `);
  }
}