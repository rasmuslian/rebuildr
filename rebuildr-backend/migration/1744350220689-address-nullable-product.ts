import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddressNullableProduct1744350220689 implements MigrationInterface {
  name = 'AddressNullableProduct1744350220689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "address" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "address_location" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "address_location" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "address" SET NOT NULL`,
    );
  }
}
