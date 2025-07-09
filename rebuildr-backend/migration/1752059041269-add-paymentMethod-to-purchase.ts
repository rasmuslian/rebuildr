import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethodToPurchase1752059041269
  implements MigrationInterface
{
  name = 'AddPaymentMethodToPurchase1752059041269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_paymentmethod_enum" AS ENUM('SWISH', 'STRIPE', 'TRUSTLY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ADD "paymentMethod" "public"."purchase_paymentmethod_enum" DEFAULT 'SWISH'`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ALTER COLUMN "paymentMethod" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchase" DROP COLUMN "paymentMethod"`,
    );
    await queryRunner.query(`DROP TYPE "public"."purchase_paymentmethod_enum"`);
  }
}
