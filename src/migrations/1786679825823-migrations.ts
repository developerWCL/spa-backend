import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1786679825823 implements MigrationInterface {
  name = 'Migrations1786679825823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "branch" ADD "branch_code" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "branch" DROP COLUMN "branch_code"`);
  }
}
