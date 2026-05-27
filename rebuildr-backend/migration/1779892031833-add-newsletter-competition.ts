import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewsletterCompetition1779892031833 implements MigrationInterface {
    name = 'AddNewsletterCompetition1779892031833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "newsletter_competition" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "productTitle" character varying NOT NULL, "productValue" character varying NOT NULL, "bodyText" text NOT NULL, "nextDrawDate" TIMESTAMP NOT NULL, "productImageId" uuid, CONSTRAINT "REL_b89a224a0e30d50a135af6fae3" UNIQUE ("productImageId"), CONSTRAINT "PK_3cedb2292465b36173231561359" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "newsletter_competition" ADD CONSTRAINT "FK_b89a224a0e30d50a135af6fae3a" FOREIGN KEY ("productImageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "newsletter_competition" DROP CONSTRAINT "FK_b89a224a0e30d50a135af6fae3a"`);
        await queryRunner.query(`DROP TABLE "newsletter_competition"`);
    }

}
