import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1779251912700 implements MigrationInterface {
  name = 'Migrations1779251912700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "spa" ADD "booking_engine_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "spa" DROP COLUMN "booking_engine_url"`,
    );
  }
}
