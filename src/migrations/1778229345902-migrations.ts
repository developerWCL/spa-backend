import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1778229345902 implements MigrationInterface {
  name = 'Migrations1778229345902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customers" ADD "date_of_birth" date`);
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "nationality" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "gender" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "gender"`);
    await queryRunner.query(
      `ALTER TABLE "customers" DROP COLUMN "nationality"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP COLUMN "date_of_birth"`,
    );
  }
}
