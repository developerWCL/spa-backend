import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1783399565614 implements MigrationInterface {
  name = 'Migrations1783399565614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "packages" ADD "display_order" integer DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "programmes" ADD "display_order" integer DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "display_order" integer DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "display_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programmes" DROP COLUMN "display_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "packages" DROP COLUMN "display_order"`,
    );
  }
}
