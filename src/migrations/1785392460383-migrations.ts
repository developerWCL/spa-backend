import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1785392460383 implements MigrationInterface {
  name = 'Migrations1785392460383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" ADD "sub_category" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "sub_category"`,
    );
  }
}
