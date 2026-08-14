import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryImageGenerationStatus1784000000000
  implements MigrationInterface
{
  name = 'AddCategoryImageGenerationStatus1784000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "category_image_generation_status_enum" AS ENUM ('PENDING', 'GENERATED', 'FAILED')
    `);
    await queryRunner.query(`
      ALTER TABLE "category"
      ADD "imageGenerationStatus" "category_image_generation_status_enum" NOT NULL DEFAULT 'PENDING',
      ADD "imageGenerationError" character varying
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "category"
      DROP COLUMN "imageGenerationError",
      DROP COLUMN "imageGenerationStatus"
    `);
    await queryRunner.query(`DROP TYPE "category_image_generation_status_enum"`);
  }
}
