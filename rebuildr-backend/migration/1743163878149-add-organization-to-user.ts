import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrganizationToUser1743163878149 implements MigrationInterface {
    name = 'AddOrganizationToUser1743163878149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_organizations_user" ("personalAccountId" uuid NOT NULL, "organizationAccountId" uuid NOT NULL, CONSTRAINT "PK_691e1696590082322e25b8213c4" PRIMARY KEY ("personalAccountId", "organizationAccountId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_636f5a0fdf89bf7b17e35db39b" ON "user_organizations_user" ("personalAccountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_25ef48454e82965c2b0fc33069" ON "user_organizations_user" ("organizationAccountId") `);
        await queryRunner.query(`CREATE TYPE "public"."user_type_enum" AS ENUM('PERSONAL', 'BUSINESS')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "type" "public"."user_type_enum" NOT NULL DEFAULT 'PERSONAL'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "organization_number" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_10213abd8e0b9192b925155fad2" UNIQUE ("organization_number")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "organization_approved_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_organizations_user" ADD CONSTRAINT "FK_636f5a0fdf89bf7b17e35db39b4" FOREIGN KEY ("personalAccountId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_organizations_user" ADD CONSTRAINT "FK_25ef48454e82965c2b0fc33069c" FOREIGN KEY ("organizationAccountId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_organizations_user" DROP CONSTRAINT "FK_25ef48454e82965c2b0fc33069c"`);
        await queryRunner.query(`ALTER TABLE "user_organizations_user" DROP CONSTRAINT "FK_636f5a0fdf89bf7b17e35db39b4"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "organization_approved_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_10213abd8e0b9192b925155fad2"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "organization_number"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."user_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_25ef48454e82965c2b0fc33069"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_636f5a0fdf89bf7b17e35db39b"`);
        await queryRunner.query(`DROP TABLE "user_organizations_user"`);
    }

}
