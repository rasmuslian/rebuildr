import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewEntity1746798781381 implements MigrationInterface {
    name = 'AddReviewEntity1746798781381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "stars" integer NOT NULL, "review" character varying NOT NULL, "purchase_id" uuid NOT NULL, "product_id" uuid NOT NULL, "reviewer_id" uuid NOT NULL, "reviewee_id" uuid NOT NULL, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_5d0020681bf0619840045f25c27" FOREIGN KEY ("purchase_id") REFERENCES "purchase"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_26b533e15b5f2334c96339a1f08" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_2f8adca6682f8238c64d767c9d3" FOREIGN KEY ("reviewer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_a7c1548c6150e7408af91ea8d5f" FOREIGN KEY ("reviewee_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_a7c1548c6150e7408af91ea8d5f"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_2f8adca6682f8238c64d767c9d3"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_26b533e15b5f2334c96339a1f08"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_5d0020681bf0619840045f25c27"`);
        await queryRunner.query(`DROP TABLE "review"`);
    }

}
