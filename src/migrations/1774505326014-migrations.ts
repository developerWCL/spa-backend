import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1774505326014 implements MigrationInterface {
  name = 'Migrations1774505326014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "overide_start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "override_start_date" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "override_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "override_end_date" date`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "override_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "override_end_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "override_start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "overide_start_date" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
  }
}
