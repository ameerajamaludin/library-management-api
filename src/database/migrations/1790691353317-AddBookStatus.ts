import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookStatus1790691353317 implements MigrationInterface {
    name = 'AddBookStatus1790691353317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" ADD "status" character varying(20) NOT NULL DEFAULT 'ACTIVE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "status"`);
    }

}
