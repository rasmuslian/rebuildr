import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShippingPrice1745926300025 implements MigrationInterface {
    name = 'AddShippingPrice1745926300025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."shipping_price_provider_enum" AS ENUM('POSTNORD', 'DHL')`);
        await queryRunner.query(`CREATE TABLE "shipping_price" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "max_weight" double precision NOT NULL, "price" integer NOT NULL, "provider" "public"."shipping_price_provider_enum" NOT NULL, CONSTRAINT "PK_8194003fd7eac4ff51f6e76f56d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "shipping_price"`);
        await queryRunner.query(`DROP TYPE "public"."shipping_price_provider_enum"`);
    }

}
