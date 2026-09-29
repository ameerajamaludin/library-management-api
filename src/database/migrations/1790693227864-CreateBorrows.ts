import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBorrows1790693227864 implements MigrationInterface {
    name = 'CreateBorrows1790693227864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "borrows" ("borrow_id" SERIAL NOT NULL, "user_id" character varying(50) NOT NULL, "copy_id" integer NOT NULL, "borrowed_at" TIMESTAMP NOT NULL, "due_at" TIMESTAMP NOT NULL, "returned_at" TIMESTAMP, CONSTRAINT "PK_069e12f05ea5ad372feed0d051e" PRIMARY KEY ("borrow_id"))`);
        await queryRunner.query(`ALTER TABLE "borrows" ADD CONSTRAINT "FK_c9b0c21ce0c14b78c266e304622" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrows" ADD CONSTRAINT "FK_4be0d26f71f4ebc4319fa134883" FOREIGN KEY ("copy_id") REFERENCES "copies"("copy_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borrows" DROP CONSTRAINT "FK_4be0d26f71f4ebc4319fa134883"`);
        await queryRunner.query(`ALTER TABLE "borrows" DROP CONSTRAINT "FK_c9b0c21ce0c14b78c266e304622"`);
        await queryRunner.query(`DROP TABLE "borrows"`);
    }

}
