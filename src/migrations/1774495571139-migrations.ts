import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1774495571139 implements MigrationInterface {
  name = 'Migrations1774495571139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP CONSTRAINT "FK_bceec80ecd19ae51b0a3aec30ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP CONSTRAINT "FK_46b10cae79661cc583bf8f63504"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP CONSTRAINT "FK_5af3f850defaf3a5303df7de6e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "overide_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "overide_start_date" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "override_end_date" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD CONSTRAINT "FK_5af3f850defaf3a5303df7de6e0" FOREIGN KEY ("subServiceId") REFERENCES "sub_services"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD CONSTRAINT "FK_46b10cae79661cc583bf8f63504" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD CONSTRAINT "FK_bceec80ecd19ae51b0a3aec30ac" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "override_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "overide_start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "overide_date" TIMESTAMP NOT NULL`,
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
}
