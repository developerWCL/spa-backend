import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1775209149796 implements MigrationInterface {
  name = 'Migrations1775209149796';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "packages" ALTER COLUMN "startDate" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "packages" ALTER COLUMN "endDate" TYPE TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "endDate"`);
    await queryRunner.query(
      `ALTER TABLE "packages" ADD "endDate" date NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "startDate"`);
    await queryRunner.query(
      `ALTER TABLE "packages" ADD "startDate" date NOT NULL`,
    );
  }
}
