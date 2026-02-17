import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTypeIntToFloatMeasurementsQuentitiesProduct1771335768170 implements MigrationInterface {
    name = 'ChangeTypeIntToFloatMeasurementsQuentitiesProduct1771335768170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "primaryQuantity" TYPE double precision
          USING "primaryQuantity"::double precision`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "secondaryQuantity" TYPE double precision
          USING "secondaryQuantity"::double precision`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "height" TYPE double precision
          USING "height"::double precision`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "width" TYPE double precision
          USING "width"::double precision`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "length" TYPE double precision
          USING "length"::double precision`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "thickness" TYPE double precision
          USING "thickness"::double precision`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "diameter" TYPE double precision
          USING "diameter"::double precision`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "weight" TYPE double precision
          USING "weight"::double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
              await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "primaryQuantity" TYPE integer
          USING "primaryQuantity"::integer`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "secondaryQuantity" TYPE integer
          USING "secondaryQuantity"::integer`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "height" TYPE integer
          USING "height"::integer`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "width" TYPE integer
          USING "width"::integer`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "length" TYPE integer
          USING "length"::integer`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "thickness" TYPE integer
          USING "thickness"::integer`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "diameter" TYPE integer
          USING "diameter"::integer`);
        await queryRunner.query(`ALTER TABLE "product" 
          ALTER COLUMN "weight" TYPE integer
          USING "weight"::integer`);

    }

}
