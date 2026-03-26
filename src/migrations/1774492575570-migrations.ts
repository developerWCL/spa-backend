import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1774492575570 implements MigrationInterface {
  name = 'Migrations1774492575570';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "price_overides" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "overide_date" TIMESTAMP NOT NULL, "price" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "subServiceId" uuid, "packageId" uuid, "programmeId" uuid, CONSTRAINT "PK_bef6623f592c8d83f08116443db" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD CONSTRAINT "FK_5af3f850defaf3a5303df7de6e0" FOREIGN KEY ("subServiceId") REFERENCES "sub_services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD CONSTRAINT "FK_46b10cae79661cc583bf8f63504" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD CONSTRAINT "FK_bceec80ecd19ae51b0a3aec30ac" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP CONSTRAINT "FK_bceec80ecd19ae51b0a3aec30ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP CONSTRAINT "FK_46b10cae79661cc583bf8f63504"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP CONSTRAINT "FK_5af3f850defaf3a5303df7de6e0"`,
    );
    await queryRunner.query(`DROP TABLE "price_overides"`);
  }
}
