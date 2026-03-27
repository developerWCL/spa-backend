import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1774407153786 implements MigrationInterface {
  name = 'Migrations1774407153786';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "authProvider" character varying NOT NULL DEFAULT 'local'`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "password" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "password" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "email" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP COLUMN "authProvider"`,
    );
  }
}
