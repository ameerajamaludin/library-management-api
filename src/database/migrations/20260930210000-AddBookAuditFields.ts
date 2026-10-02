import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class AddBookAuditFields20260930210000
  implements MigrationInterface
{
  name = 'AddBookAuditFields20260930210000';

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "books"
      ADD "updated_by" character varying(50)
    `);

    await queryRunner.query(`
      ALTER TABLE "books"
      ADD "updated_at" TIMESTAMP
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "books"
      DROP COLUMN "updated_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "books"
      DROP COLUMN "updated_by"
    `);
  }
}