import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePaymentMethods1760016536985 implements MigrationInterface {
  name = 'ChangePaymentMethods1760016536985';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."purchase_paymentmethod_enum" RENAME TO "purchase_paymentmethod_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_paymentmethod_enum" AS ENUM('SWISH', 'CARD')`,
    );
    await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "paymentMethod" TYPE "public"."purchase_paymentmethod_enum" 
          USING CASE 
            WHEN "paymentMethod" = 'SWISH' THEN 'SWISH'::purchase_paymentmethod_enum
            WHEN "paymentMethod" = 'STRIPE' THEN 'CARD'::purchase_paymentmethod_enum
            WHEN "paymentMethod" = 'TRUSTLY' THEN NULL
          END`);
    await queryRunner.query(
      `DROP TYPE "public"."purchase_paymentmethod_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_paymentmethod_enum_old" AS ENUM('SWISH', 'STRIPE', 'TRUSTLY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ALTER COLUMN "paymentMethod" TYPE "public"."purchase_paymentmethod_enum_old" USING "paymentMethod"::"text"::"public"."purchase_paymentmethod_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."purchase_paymentmethod_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."purchase_paymentmethod_enum_old" RENAME TO "purchase_paymentmethod_enum"`,
    );
  }
}
