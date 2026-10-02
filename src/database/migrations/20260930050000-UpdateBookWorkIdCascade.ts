import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBookWorkIdCascade20260930050000
  implements MigrationInterface
{
  name = 'UpdateBookWorkIdCascade20260930050000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Copies → Books
    await queryRunner.query(`
      ALTER TABLE "copies"
      DROP CONSTRAINT "FK_bbc40d3cc8c331af4dc10f60c3a"
    `);

    await queryRunner.query(`
      ALTER TABLE "copies"
      ADD CONSTRAINT "FK_bbc40d3cc8c331af4dc10f60c3a"
      FOREIGN KEY ("openlibrary_work_id")
      REFERENCES "books"("openlibrary_work_id")
      ON DELETE NO ACTION
      ON UPDATE CASCADE
    `);

    // BookAuthors → Books
    await queryRunner.query(`
      ALTER TABLE "book_authors"
      DROP CONSTRAINT "FK_fb6cbf4b9bfdc3b54c2d89715ff"
    `);

    await queryRunner.query(`
      ALTER TABLE "book_authors"
      ADD CONSTRAINT "FK_fb6cbf4b9bfdc3b54c2d89715ff"
      FOREIGN KEY ("openlibrary_work_id")
      REFERENCES "books"("openlibrary_work_id")
      ON DELETE NO ACTION
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "book_authors"
      DROP CONSTRAINT "FK_fb6cbf4b9bfdc3b54c2d89715ff"
    `);

    await queryRunner.query(`
      ALTER TABLE "book_authors"
      ADD CONSTRAINT "FK_fb6cbf4b9bfdc3b54c2d89715ff"
      FOREIGN KEY ("openlibrary_work_id")
      REFERENCES "books"("openlibrary_work_id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "copies"
      DROP CONSTRAINT "FK_bbc40d3cc8c331af4dc10f60c3a"
    `);

    await queryRunner.query(`
      ALTER TABLE "copies"
      ADD CONSTRAINT "FK_bbc40d3cc8c331af4dc10f60c3a"
      FOREIGN KEY ("openlibrary_work_id")
      REFERENCES "books"("openlibrary_work_id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }
}