import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInitialCategories1718264020654 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Byggmaterial')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Byggskivor' FROM "parent"
          UNION ALL
          SELECT id, 'Gipsskivor' FROM "parent"
          UNION ALL
          SELECT id, 'Isolering' FROM "parent"
          UNION ALL
          SELECT id, 'Tätskikt' FROM "parent"
          UNION ALL
          SELECT id, 'Byggnadsblock & ballast' FROM "parent"
          UNION ALL
          SELECT id, 'Dränering & markrör' FROM "parent"
          UNION ALL
          SELECT id, 'Stål & plåtprodukter' FROM "parent"
          UNION ALL
          SELECT id, 'Armering' FROM "parent"
          UNION ALL
          SELECT id, 'Byggmaterial övrigt' from "parent"`,
    );

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Träprodukter')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Innerpaneler' FROM "parent"
          UNION ALL
          SELECT id, 'Limträ' FROM "parent"
          UNION ALL
          SELECT id, 'Listverk' FROM "parent"
          UNION ALL
          SELECT id, 'Plank & reglar' FROM "parent"
          UNION ALL
          SELECT id, 'Trall' FROM "parent"
          UNION ALL
          SELECT id, 'Tryckimpregnerat virke' FROM "parent"
          UNION ALL
          SELECT id, 'Virke' FROM "parent"
          UNION ALL
          SELECT id, 'Ytterpaneler' FROM "parent"
          UNION ALL
          SELECT id, 'Träprodukter övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Dörrar')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Ytterdörrar' FROM "parent"
          UNION ALL
          SELECT id, 'Innerdörrar' FROM "parent"
          UNION ALL
          SELECT id, 'Skjutdörrar' FROM "parent"
          UNION ALL
          SELECT id, 'Ståldörrar' FROM "parent"
          UNION ALL
          SELECT id, 'Garageportar' FROM "parent"
          UNION ALL
          SELECT id, 'Dörrar övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Fönster')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Sidohängda fönster' FROM "parent"
          UNION ALL
          SELECT id, 'Karmfästa fönster' FROM "parent"
          UNION ALL
          SELECT id, 'Fönsterdörrar' FROM "parent"
          UNION ALL
          SELECT id, 'Takfönster' FROM "parent"
          UNION ALL
          SELECT id, 'Fönster övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Golv')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Parkettgolv' FROM "parent"
          UNION ALL
          SELECT id, 'Massiva trägolv' FROM "parent"
          UNION ALL
          SELECT id, 'Fanérgolv' FROM "parent"
          UNION ALL
          SELECT id, 'Laminatgolv' FROM "parent"
          UNION ALL
          SELECT id, 'Mattor' FROM "parent"
          UNION ALL
          SELECT id, 'Golvlister' FROM "parent"
          UNION ALL
          SELECT id, 'Golv övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Interiör')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Elementskydd' FROM "parent"
          UNION ALL
          SELECT id, 'Fönsterbänkar' FROM "parent"
          UNION ALL
          SELECT id, 'Garderob & förvaring' FROM "parent"
          UNION ALL
          SELECT id, 'Konsoler' FROM "parent"
          UNION ALL
          SELECT id, 'Interiör övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Färg')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Inomhusfärg' FROM "parent"
          UNION ALL
          SELECT id, 'Utomhusfärg' FROM "parent"
          UNION ALL
          SELECT id, 'Golvfärg & ytbehandling' FROM "parent"
          UNION ALL
          SELECT id, 'Kitt & spackel' FROM "parent"
          UNION ALL
          SELECT id, 'Oljor & träskydd' FROM "parent"
          UNION ALL
          SELECT id, 'Måleriverktyg' FROM "parent"
          UNION ALL
          SELECT id, 'Maskerings- & täckmaterial' FROM "parent"
          UNION ALL
          SELECT id, 'Väv & tapet' FROM "parent"
          UNION ALL
          SELECT id, 'Färg övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Fästdon - Spik & skruv m.m')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Spik' FROM "parent"
          UNION ALL
          SELECT id, 'Skruv' FROM "parent"
          UNION ALL
          SELECT id, 'Bult, muttrar & brickor' FROM "parent"
          UNION ALL
          SELECT id, 'Infästningar & expander' FROM "parent"
          UNION ALL
          SELECT id, 'Nitar' FROM "parent"
          UNION ALL
          SELECT id, 'Byggbeslag' FROM "parent"
          UNION ALL
          SELECT id, 'Fästdon övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Tak')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Innertak' FROM "parent"
          UNION ALL
          SELECT id, 'Yttertak' FROM "parent"
          UNION ALL
          SELECT id, 'Takavvattning' FROM "parent"
          UNION ALL
          SELECT id, 'Taksäkerhet' FROM "parent"
          UNION ALL
          SELECT id, 'Taktegel' FROM "parent"
          UNION ALL
          SELECT id, 'Solskydd' FROM "parent"
          UNION ALL
          SELECT id, 'Tak övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Kakel & klinker')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Kakel' FROM "parent"
          UNION ALL
          SELECT id, 'Klinker' FROM "parent"
          UNION ALL
          SELECT id, 'Mosaik' FROM "parent"
          UNION ALL
          SELECT id, 'Sten & keramik' FROM "parent"
          UNION ALL
          SELECT id, 'Fäst & Fogmassa' FROM "parent"
          UNION ALL
          SELECT id, 'Tätskikt' FROM "parent"
          UNION ALL
          SELECT id, 'Kakel övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Kök & bad')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Kök' FROM "parent"
          UNION ALL
          SELECT id, 'Badrum' FROM "parent"
          UNION ALL
          SELECT id, 'Blandare' FROM "parent"
          UNION ALL
          SELECT id, 'Sanitet' FROM "parent"
          UNION ALL
          SELECT id, 'Tvättutrustning' FROM "parent"
          UNION ALL
          SELECT id, 'Kök övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Elinstallation')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Belysning' FROM "parent"
          UNION ALL
          SELECT id, 'Installationsmaterial' FROM "parent"
          UNION ALL
          SELECT id, 'Kabel & skarvsladd' FROM "parent"
          UNION ALL
          SELECT id, 'Kyl & värme' FROM "parent"
          UNION ALL
          SELECT id, 'Elinstallation övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Utemiljö')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Markplattor' FROM "parent"
          UNION ALL
          SELECT id, 'Gatsten' FROM "parent"
          UNION ALL
          SELECT id, 'Jord & kompost' FROM "parent"
          UNION ALL
          SELECT id, 'Sand & grus' FROM "parent"
          UNION ALL
          SELECT id, 'Bevattning' FROM "parent"
          UNION ALL
          SELECT id, 'Utemiljö övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Maskiner & Verktyg')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Hammare, bryt & spänn' FROM "parent"
          UNION ALL
          SELECT id, 'Bult & spikverktyg' FROM "parent"
          UNION ALL
          SELECT id, 'Såg, fil & slip' FROM "parent"
          UNION ALL
          SELECT id, 'Laser & mätinstrument' FROM "parent"
          UNION ALL
          SELECT id, 'Slip & fräsverktyg' FROM "parent"
          UNION ALL
          SELECT id, 'Tänger, kniv & saxar' FROM "parent"
          UNION ALL
          SELECT id, 'Mur, puts- & plattsättningsverktyg' FROM "parent"
          UNION ALL
          SELECT id, 'Städmaskiner' FROM "parent"
          UNION ALL
          SELECT id, 'Trädgårdsredskap' FROM "parent"
          UNION ALL
          SELECT id, 'Verktyg övrigt' FROM "parent"`);

    await queryRunner.query(`
          WITH parent AS (
          INSERT INTO "category" ("name")
              VALUES('Arbetsplats')
            RETURNING
              id
          ) INSERT INTO "category" ("parentId", "name")
          SELECT id, 'Stegar & ställningar' FROM "parent"
          UNION ALL
          SELECT id, 'Transport & skottkärror' FROM "parent"
          UNION ALL
          SELECT id, 'Drag, lyft & ställ' FROM "parent"
          UNION ALL
          SELECT id, 'Byggbelysning' FROM "parent"
          UNION ALL
          SELECT id, 'Arbetsplatstillbehör' FROM "parent"
          UNION ALL
          SELECT id, 'Arbetsplats övrigt' FROM "parent"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`Delete from "category"`);
  }
}
