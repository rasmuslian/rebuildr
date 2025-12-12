import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectMappinMandatory1765542433677 implements MigrationInterface {
  name = 'ProjectMappinMandatory1765542433677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    //Add mapPins to projects that don't have them yet
    await queryRunner.query(
      `WITH 
        map_pin AS (
          INSERT INTO map_pin (location, address)
          SELECT "addressLocation", address
            FROM project
            WHERE "mapPinId" IS NULL
          RETURNING id
        ),
        ordered_project AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
            FROM project
            WHERE "mapPinId" IS NULL
        ),
        ordered_mappins AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
            FROM map_pin
        )
      UPDATE project
      SET 
        "mapPinId" = ordered_mappins.id
        FROM ordered_project
        JOIN ordered_mappins USING (rn)
        WHERE project.id = ordered_project.id`,
    );

    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_f0366e78bdd051d290af84d1d1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ALTER COLUMN "mapPinId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_f0366e78bdd051d290af84d1d1c" FOREIGN KEY ("mapPinId") REFERENCES "map_pin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_f0366e78bdd051d290af84d1d1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ALTER COLUMN "mapPinId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_f0366e78bdd051d290af84d1d1c" FOREIGN KEY ("mapPinId") REFERENCES "map_pin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
