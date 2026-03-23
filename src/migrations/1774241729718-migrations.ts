import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1774241729718 implements MigrationInterface {
  name = 'Migrations1774241729718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sub_services" ADD "only_package" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sub_services" DROP COLUMN "only_package"`,
    );
  }
}
