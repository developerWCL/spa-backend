import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1774504743563 implements MigrationInterface {
  name = 'Migrations1774504743563';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "overide_start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "overide_start_date" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "override_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "override_end_date" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "override_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "override_end_date" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "overide_start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "overide_start_date" TIMESTAMP NOT NULL`,
    );
  }
}
