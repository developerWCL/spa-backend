import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1776391530932 implements MigrationInterface {
  name = 'Migrations1776391530932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staffs" ADD "phone" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "staffs" ADD "specialties" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "staffs" ADD "working_hours" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "staffs" DROP COLUMN "working_hours"`);
    await queryRunner.query(`ALTER TABLE "staffs" DROP COLUMN "specialties"`);
    await queryRunner.query(`ALTER TABLE "staffs" DROP COLUMN "phone"`);
  }
}
