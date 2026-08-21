import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInternalReferenceNumberToProduct1782000000002
  implements MigrationInterface
{
  name = 'AddInternalReferenceNumberToProduct1782000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "product" ADD "internalReferenceNumber" character varying',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "product" DROP COLUMN "internalReferenceNumber"',
    );
  }
}