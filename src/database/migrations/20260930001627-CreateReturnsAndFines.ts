import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class CreateReturnsAndFines20260930001627
  implements MigrationInterface
{
  name = 'CreateReturnsAndFines20260930001627';

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "returns" (
        "return_id" SERIAL NOT NULL,
        "borrow_id" integer NOT NULL,
        "returned_at" TIMESTAMP NOT NULL,
        "condition" character varying(50) NOT NULL,
        "notes" text,
        CONSTRAINT "PK_returns_return_id"
          PRIMARY KEY ("return_id"),
        CONSTRAINT "UQ_returns_borrow_id"
          UNIQUE ("borrow_id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "returns"
      ADD CONSTRAINT "FK_returns_borrow"
      FOREIGN KEY ("borrow_id")
      REFERENCES "borrows"("borrow_id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "fines" (
        "fine_id" SERIAL NOT NULL,
        "borrow_id" integer NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "reason" character varying(100) NOT NULL,
        "status" character varying(50) NOT NULL,
        "paid_at" TIMESTAMP,
        CONSTRAINT "PK_fines_fine_id"
          PRIMARY KEY ("fine_id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "fines"
      ADD CONSTRAINT "FK_fines_borrow"
      FOREIGN KEY ("borrow_id")
      REFERENCES "borrows"("borrow_id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fines"
      DROP CONSTRAINT "FK_fines_borrow"
    `);

    await queryRunner.query(`
      DROP TABLE "fines"
    `);

    await queryRunner.query(`
      ALTER TABLE "returns"
      DROP CONSTRAINT "FK_returns_borrow"
    `);

    await queryRunner.query(`
      DROP TABLE "returns"
    `);
  }
}