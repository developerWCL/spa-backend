import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1774411083529 implements MigrationInterface {
  name = 'Migrations1774411083529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "beds" DROP COLUMN "reason"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "beds" ADD "reason" character varying`,
    );
  }
}
