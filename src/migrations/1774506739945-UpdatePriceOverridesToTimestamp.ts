import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePriceOverridesToTimestamp1774506739945 implements MigrationInterface {
  name = 'UpdatePriceOverridesToTimestamp1774506739945';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, handle NULL values by setting them to NOW()
    await queryRunner.query(
      `UPDATE "price_overides" SET "override_start_date" = CAST(NOW() AS DATE) WHERE "override_start_date" IS NULL`,
    );

    // Convert the columns using CAST
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "override_start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "override_start_date" TIMESTAMP NOT NULL DEFAULT NOW()`,
    );

    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "override_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "override_end_date" TIMESTAMP`,
    );

    // Remove the default after migration
    await queryRunner.query(
      `ALTER TABLE "price_overides" ALTER COLUMN "override_start_date" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "override_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "override_end_date" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" DROP COLUMN "override_start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_overides" ADD "override_start_date" date NOT NULL`,
    );
  }
}
