import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1790673974602 implements MigrationInterface {
    name = 'InitialSchema1790673974602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "copies" ("copy_id" SERIAL NOT NULL, "openlibrary_work_id" character varying(255) NOT NULL, "barcode" character varying(100) NOT NULL, "status" character varying(50) NOT NULL, CONSTRAINT "UQ_738666775042d63902d2e8a0303" UNIQUE ("barcode"), CONSTRAINT "PK_74b40c83ac711183e11616a1d55" PRIMARY KEY ("copy_id"))`);
        await queryRunner.query(`CREATE TABLE "books" ("openlibrary_work_id" character varying(255) NOT NULL, "title" character varying(500) NOT NULL, "description" text, "published_month" integer, "published_year" integer, "category_id" integer NOT NULL, "fiction_nonfiction" character varying(50), "isbn" character varying(50), "cover_image_small" character varying, "cover_image_medium" character varying, "cover_image_large" character varying, CONSTRAINT "PK_24bad034a53f24e2236a6e4493f" PRIMARY KEY ("openlibrary_work_id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("category_id" SERIAL NOT NULL, "category_parent_id" integer, "category_name" character varying(255) NOT NULL, "category_slug" character varying(255) NOT NULL, "category_description" text, "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_8b0983b8fd8d7ef4eaa68925e40" UNIQUE ("category_slug"), CONSTRAINT "PK_51615bef2cea22812d0dcab6e18" PRIMARY KEY ("category_id"))`);
        await queryRunner.query(`CREATE TABLE "authors" ("author_id" character varying(255) NOT NULL, "author_name" character varying(255) NOT NULL, CONSTRAINT "PK_6842400a659f5909e03305b6ff0" PRIMARY KEY ("author_id"))`);
        await queryRunner.query(`CREATE TABLE "book_authors" ("openlibrary_work_id" character varying(255) NOT NULL, "author_id" character varying(255) NOT NULL, CONSTRAINT "PK_a54c2c007733144b008dc9a17b6" PRIMARY KEY ("openlibrary_work_id", "author_id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "role_id" integer NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("role_id" SERIAL NOT NULL, "role_name" character varying(50) NOT NULL, CONSTRAINT "UQ_ac35f51a0f17e3e1fe121126039" UNIQUE ("role_name"), CONSTRAINT "PK_09f4c8130b54f35925588a37b6a" PRIMARY KEY ("role_id"))`);
        await queryRunner.query(`ALTER TABLE "copies" ADD CONSTRAINT "FK_bbc40d3cc8c331af4dc10f60c3a" FOREIGN KEY ("openlibrary_work_id") REFERENCES "books"("openlibrary_work_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_46f5b35b90175a660f99810bc97" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_authors" ADD CONSTRAINT "FK_fb6cbf4b9bfdc3b54c2d89715ff" FOREIGN KEY ("openlibrary_work_id") REFERENCES "books"("openlibrary_work_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_authors" ADD CONSTRAINT "FK_6fb8ac32a0a0bbca076b2cf7c5a" FOREIGN KEY ("author_id") REFERENCES "authors"("author_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "book_authors" DROP CONSTRAINT "FK_6fb8ac32a0a0bbca076b2cf7c5a"`);
        await queryRunner.query(`ALTER TABLE "book_authors" DROP CONSTRAINT "FK_fb6cbf4b9bfdc3b54c2d89715ff"`);
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_46f5b35b90175a660f99810bc97"`);
        await queryRunner.query(`ALTER TABLE "copies" DROP CONSTRAINT "FK_bbc40d3cc8c331af4dc10f60c3a"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "book_authors"`);
        await queryRunner.query(`DROP TABLE "authors"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "books"`);
        await queryRunner.query(`DROP TABLE "copies"`);
    }

}
