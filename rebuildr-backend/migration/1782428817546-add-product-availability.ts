import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductAvailability1782428817546 implements MigrationInterface {
  name = 'AddProductAvailability1782428817546';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."product_availability_enum" AS ENUM('AVAILABLE', 'UPCOMING')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "availability" "public"."product_availability_enum" NOT NULL DEFAULT 'AVAILABLE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "estimatedAvailableAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "estimatedAvailableAt"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "availability"`);
    await queryRunner.query(`DROP TYPE "public"."product_availability_enum"`);
  }
}
