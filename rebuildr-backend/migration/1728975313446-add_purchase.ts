import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchase1728975313446 implements MigrationInterface {
    name = 'AddPurchase1728975313446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "product_id" uuid NOT NULL, "buyer_id" uuid NOT NULL, "rocker_payment_id" character varying, "rocker_offer_id" character varying, "payment_sent_to_rocker_at" TIMESTAMP WITH TIME ZONE NOT NULL, "payment_accepted_by_rocker_at" TIMESTAMP WITH TIME ZONE NOT NULL, "delivered_at" TIMESTAMP WITH TIME ZONE NOT NULL, "approved_at" TIMESTAMP WITH TIME ZONE NOT NULL, "disapproved_at" TIMESTAMP WITH TIME ZONE NOT NULL, "payout_received_at" TIMESTAMP WITH TIME ZONE NOT NULL, "failure_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_3bd8aa6019bd5f2e6c8071b2b98" UNIQUE ("rocker_payment_id"), CONSTRAINT "PK_86cc2ebeb9e17fc9c0774b05f69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD CONSTRAINT "FK_70f3fd21152b586eb4ceae61c43" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD CONSTRAINT "FK_68e5815290fd0e71e36093eb14c" FOREIGN KEY ("buyer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_68e5815290fd0e71e36093eb14c"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_70f3fd21152b586eb4ceae61c43"`);
        await queryRunner.query(`DROP TABLE "purchase"`);
    }

}
