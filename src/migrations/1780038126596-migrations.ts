import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1780038126596 implements MigrationInterface {
  name = 'Migrations1780038126596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD "max_used_per_account" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP COLUMN "max_used_per_account"`,
    );
  }
}
