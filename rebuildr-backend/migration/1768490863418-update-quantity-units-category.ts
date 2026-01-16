import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateQuantityUnitsCategory1768490863418
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'M2', "secondaryQuantityUnit" = 'BOARDS'
      where c."name" = 'Byggskivor'
    `);

    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'M2', "secondaryQuantityUnit" = 'ROLLS'
      FROM category parent
      WHERE c."name" = 'Tätskikt' AND parent.id = c."parentId" AND parent."name" ILIKE 'byggmaterial'
    `);

    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'M2', "secondaryQuantityUnit" = 'AMOUNT'
      where c."name" = 'Armering'
    `);
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'KG', "secondaryQuantityUnit" = 'BAGS'
      where c."name" = 'Fog- och mursand'
    `);
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'AMOUNT', "secondaryQuantityUnit" = 'PACKAGES'
      where c."name" = 'Spik'
    `);
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'AMOUNT', "secondaryQuantityUnit" = 'PACKAGES'
      where c."name" = 'Skruv'
    `);
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'AMOUNT', "secondaryQuantityUnit" = 'PACKAGES'
      where c."name" = 'Bult, muttrar & brickor'
    `);
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'AMOUNT', "secondaryQuantityUnit" = 'PACKAGES'
      where c."name" = 'Infästningar & expander'
    `);
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'AMOUNT', "secondaryQuantityUnit" = 'PACKAGES'
      where c."name" = 'Nitar'
    `);
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'LITERS', "secondaryQuantityUnit" = 'AMOUNT'
      where c."name" = 'Oljor & träskydd'
    `);
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'KG', "secondaryQuantityUnit" = 'M2'
      where c."name" = 'Fäst & fogmassa'
    `);
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'M2', "secondaryQuantityUnit" = 'AMOUNT'
      FROM category parent
      where c."name" = 'Tätskikt' AND parent.id = c."parentId" and parent."name" ILIKE 'kakel & klinker' 
      RETURNING *
    `);
    await queryRunner.query(`UPDATE category c
      SET "primaryQuantityUnit" = 'M2', "secondaryQuantityUnit" = 'BOARDS'
      where c."name" = 'Gipsskivor'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'M2', "primaryQuantityUnit" = 'BOARDS'
      where c."name" = 'Byggskivor'
    `);

    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'M2', "primaryQuantityUnit" = 'ROLLS'
      FROM category parent
      WHERE c."name" = 'Tätskikt' AND parent.id = c."parentId" AND parent."name" ILIKE 'byggmaterial'
    `);

    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'M2', "primaryQuantityUnit" = 'AMOUNT'
      where c."name" = 'Armering'
    `);
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'KG', "primaryQuantityUnit" = 'BAGS'
      where c."name" = 'Fog- och mursand'
    `);
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'AMOUNT', "primaryQuantityUnit" = 'PACKAGES'
      where c."name" = 'Spik'
    `);
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'AMOUNT', "primaryQuantityUnit" = 'PACKAGES'
      where c."name" = 'Skruv'
    `);
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'AMOUNT', "primaryQuantityUnit" = 'PACKAGES'
      where c."name" = 'Bult, muttrar & brickor'
    `);
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'AMOUNT', "primaryQuantityUnit" = 'PACKAGES'
      where c."name" = 'Infästningar & expander'
    `);
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'AMOUNT', "primaryQuantityUnit" = 'PACKAGES'
      where c."name" = 'Nitar'
    `);
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'LITERS', "primaryQuantityUnit" = 'AMOUNT'
      where c."name" = 'Oljor & träskydd'
    `);
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'KG', "primaryQuantityUnit" = 'M2'
      where c."name" = 'Fäst & fogmassa'
    `);
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'M2', "primaryQuantityUnit" = 'AMOUNT'
      FROM category parent
      where c."name" = 'Tätskikt' AND parent.id = c."parentId" and parent."name" ILIKE 'kakel & klinker' 
      RETURNING *
    `);
    await queryRunner.query(`UPDATE category c
      SET "secondaryQuantityUnit" = 'M2', "primaryQuantityUnit" = 'BOARDS'
      where c."name" = 'Gipsskivor'
    `);
  }
}
